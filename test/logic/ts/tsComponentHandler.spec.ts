import { expect } from "chai";
import { TSComponentHandler } from "../../../src/logic/ts";
import { expectCodeMatch, removeLineBreaksAndSpaces } from "../../utils";

describe("Angular typescript handler", () => {
  it("adds input signal property using input() API", () => {
    const tsHandler = new TSComponentHandler(`
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
  standalone: false
})
export class TestComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {
  }
}
    `);
    const code = tsHandler.addInput("test").stringify();
    // Should use signals API: test = input()
    expectCodeMatch(code, `test = input()`);
    // Should import input from @angular/core
    expectImportMatch(code, "input", "@angular/core");
  });

  it("adds multiple input signal properties", () => {
    const tsHandler = new TSComponentHandler(`
import { Component } from '@angular/core';
@Component({ selector: 'app-test', standalone: false })
export class TestComponent {}
    `);
    const code = tsHandler.addInput("title").addInput("count").stringify();
    expectCodeMatch(code, `title = input()`);
    expectCodeMatch(code, `count = input()`);
  });
});

function expectImportMatch(code: string, imp: string, pkg: string): void {
  const regExpImportStatement = RegExp(
    `import \\{.*?${imp}.*?\\} from '${pkg}'`,
    "g"
  );
  expect(removeLineBreaksAndSpaces(code)).to.match(regExpImportStatement);
}
