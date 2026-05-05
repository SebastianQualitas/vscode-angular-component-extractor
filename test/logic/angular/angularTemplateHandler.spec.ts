import { parse as ngParseHtml } from "angular-html-parser";
import { expect } from "chai";
import {
  getInterpolations,
  getPropertyBindings,
} from "../../../src/logic/angular";
describe("Angular template handler", () => {
  describe("getInterpolations", () => {
    it("should not find any interpolations if there are non", () => {
      const input = `<button></button>`;
      const { rootNodes } = ngParseHtml(input);
      const result = getInterpolations(rootNodes);
      expect(result.length).to.equal(0);
    });

    it("should find a single interpolation", () => {
      const input = `<button>{{any value}}</button>`;
      const { rootNodes } = ngParseHtml(input);
      const result = getInterpolations(rootNodes);
      expect(result.length).to.equal(1);
      const [interpolationOne] = result[0].matches;
      expect(interpolationOne.groups).to.deep.equal(["any value"]);
    });

    it("should find a single interpolation and ignore content which is not part of the interpolation", () => {
      const input = `<button>This is not part of the value{{any value}}</button>`;
      const { rootNodes } = ngParseHtml(input);
      const result = getInterpolations(rootNodes);
      expect(result.length).to.equal(1);
      const [interpolationOne] = result[0].matches;
      expect(interpolationOne.groups).to.deep.equal(["any value"]);
    });

    it("should find multiple interpolations within the same text", () => {
      const input = `<button>This is not part of the value{{any value}} Some more text thats not captured {{any other value}}</button>`;
      const { rootNodes } = ngParseHtml(input);
      const result = getInterpolations(rootNodes);
      expect(result.length).to.equal(1);
      const [interpolationOne, interpolationTwo] = result[0].matches;
      expect(interpolationOne.groups).to.deep.equal(["any value"]);
      expect(interpolationTwo.groups).to.deep.equal(["any other value"]);
    });
  });

  describe("getPropertyBindings", () => {
    it("should return empty array when no property bindings exist", () => {
      const input = `<button>hello</button>`;
      const { rootNodes } = ngParseHtml(input);
      expect(getPropertyBindings(rootNodes)).to.deep.equal([]);
    });

    it("should detect a single property binding", () => {
      const input = `<child-comp [title]="title"></child-comp>`;
      const { rootNodes } = ngParseHtml(input);
      expect(getPropertyBindings(rootNodes)).to.deep.equal(["title"]);
    });

    it("should detect multiple property bindings and deduplicate", () => {
      const input = `<child-comp [title]="title" [label]="label" [title]="title"></child-comp>`;
      const { rootNodes } = ngParseHtml(input);
      const result = getPropertyBindings(rootNodes);
      expect(result).to.include("title");
      expect(result).to.include("label");
      expect(result.filter((r) => r === "title").length).to.equal(1);
    });

    it("should not include non-binding attributes", () => {
      const input = `<button class="btn" id="x" [disabled]="isDisabled">click</button>`;
      const { rootNodes } = ngParseHtml(input);
      expect(getPropertyBindings(rootNodes)).to.deep.equal(["disabled"]);
    });
  });
});
