import { expect, use as chaiUse } from "chai";
import { getChanges, Input } from "../../src/logic";
import { Changes, FileChange, FileChangeUpdate } from "../../src/types";
import * as path from "path";
import chaiExclude from "chai-exclude";
import { expectCodeMatch } from "../utils";

chaiUse(chaiExclude);

describe("Angular getChanges", () => {
  it("static content", () => {
    const input: Input = {
      directory: "/baseDir",
      componentName: "test",
      config: {
        defaultPrefix: "app",
      },
      selectedText: `<button>hello world</button>`,
    };
    const expectedOutput: Changes = {
      originTemplateReplacement: `<app-test></app-test>`,
      files: [
        {
          content: `<button>hello world</button>`,
          type: "replace",
          path: path.join("/baseDir", "test", "test.component.html"),
        },
        {
          content: "",
          type: "replace",
          path: path.join("/baseDir", "test", "test.component.css"),
        },
      ],
    };
    const result = getChanges(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it("static content with scss style extension", () => {
    const input: Input = {
      directory: "/baseDir",
      componentName: "test",
      config: { defaultPrefix: "app" },
      selectedText: `<button>hello world</button>`,
      styleExtension: "scss",
    };
    const result = getChanges(input);
    const styleFile = result.files.find((f) =>
      f.path.endsWith(".component.scss")
    );
    expect(styleFile).to.not.be.undefined;
    expect(styleFile?.type).to.equal("replace");
  });

  it("static content with associated styles", () => {
    const input: Input = {
      directory: "/baseDir",
      componentName: "test",
      config: { defaultPrefix: "app" },
      selectedText: `<button>hello world</button>`,
      styleExtension: "scss",
      associatedStyles: ".btn { color: red; }",
    };
    const result = getChanges(input);
    const styleFile = result.files.find((f) =>
      f.path.endsWith(".component.scss")
    ) as FileChange & { content: string };
    expect(styleFile?.content).to.equal(".btn { color: red; }");
  });

  it("static content with one template interpolation", () => {
    const input: Input = {
      directory: "/baseDir",
      componentName: "test",
      config: {
        defaultPrefix: "app",
      },
      selectedText: `<button>hello world {{title}}</button>`,
    };
    const expectedOutput: Changes = {
      originTemplateReplacement: `<app-test [title]="title"></app-test>`,
      files: [
        {
          type: "replace",
          content: `<button>hello world {{title}}</button>`,
          path: path.join("/baseDir", "test", "test.component.html"),
        },
        {
          type: "replace",
          content: "",
          path: path.join("/baseDir", "test", "test.component.css"),
        },
        {
          type: "update",
          path: path.join("/baseDir", "test", "test.component.ts"),
        } as FileChange,
      ],
    };
    const result = getChanges(input);
    expect(result).excludingEvery("newContent").to.deep.equal(expectedOutput);

    const testComp = `
import { Component } from '@angular/core';
@Component({ selector: 'app-test', templateUrl: './test.component.html', styleUrl: './test.component.css', standalone: false })
export class TestComponent {}`;
    const newContent = (
      result.files.filter(
        (change) => change.type === "update"
      )[0] as FileChangeUpdate
    ).newContent;
    // Should use input() signals API, not @Input() decorator
    expectCodeMatch(newContent(testComp), `title = input()`);
  });

  it("property bindings are detected as inputs", () => {
    const input: Input = {
      directory: "/baseDir",
      componentName: "test",
      config: { defaultPrefix: "app" },
      selectedText: `<child [label]="label" [count]="count"></child>`,
    };
    const result = getChanges(input);
    expect(result.originTemplateReplacement).to.equal(
      `<app-test [label]="label" [count]="count"></app-test>`
    );
    const tsChange = result.files.find(
      (f) => f.type === "update"
    ) as FileChangeUpdate;
    expect(tsChange).to.not.be.undefined;

    const testComp = `
import { Component } from '@angular/core';
@Component({ selector: 'app-test', templateUrl: './test.component.html', styleUrl: './test.component.css', standalone: false })
export class TestComponent {}`;
    const code = tsChange.newContent(testComp);
    expectCodeMatch(code, `label = input()`);
    expectCodeMatch(code, `count = input()`);
  });

  it("deduplicates inputs from interpolations and property bindings", () => {
    const input: Input = {
      directory: "/baseDir",
      componentName: "test",
      config: { defaultPrefix: "app" },
      // [title] binding AND {{title}} interpolation — should appear only once
      selectedText: `<child [title]="title">{{title}}</child>`,
    };
    const result = getChanges(input);
    const tsChange = result.files.find(
      (f) => f.type === "update"
    ) as FileChangeUpdate;
    const testComp = `
import { Component } from '@angular/core';
@Component({ selector: 'app-test', standalone: false })
export class TestComponent {}`;
    const code = tsChange.newContent(testComp);
    // title should appear exactly once as input
    const matches = code.match(/title\s*=\s*input\(\)/g) ?? [];
    expect(matches.length).to.equal(1);
  });
});
