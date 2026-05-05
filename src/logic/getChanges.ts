import * as ngHtmlParser from "angular-html-parser";
import * as path from "path";
import { Changes, Config, FileChange } from "../types";
import {
  getInterpolations,
  getPropertyBindings,
  TemplateInterpolation,
} from "./angular";
import { TSComponentHandler } from "./ts";
import { StyleExtension } from "../utils/getStyleExtension";

export interface Input {
  directory: string;
  componentName: string;
  selectedText: string;
  config: Config;
  styleExtension?: StyleExtension;
  associatedStyles?: string;
}

interface Interpolation {
  text: string;
}

/**
 * Convert component information into Changes object
 * @param input Input for a component change
 * @returns Changes object
 */
export const getChanges = (input: Input): Changes => {
  const { rootNodes } = ngHtmlParser.parse(input.selectedText);

  // Collect inputs from {{ interpolations }} and [propertyBindings]
  const interpolations = getInterpolationTexts(getInterpolations(rootNodes));
  const propertyBindings = getPropertyBindings(rootNodes).map((text) => ({
    text,
  }));

  // Deduplicate: property bindings take precedence, then interpolations
  const allInputs = deduplicateByText([...propertyBindings, ...interpolations]);

  const styleExt = input.styleExtension ?? "css";

  const changes: Changes = {
    originTemplateReplacement: getReplacement(input, allInputs),
    files: [getComponentTemplateChange(input)],
  };

  // Always emit a style file for the new component
  changes.files.push(getComponentStyleChange(input, styleExt));

  if (allInputs.length > 0) {
    changes.files.push(getComponentTypeScriptChange(input, allInputs));
  }

  return changes;
};

function deduplicateByText(inputs: Interpolation[]): Interpolation[] {
  const seen = new Set<string>();
  return inputs.filter(({ text }) => {
    if (seen.has(text)) {
      return false;
    }
    seen.add(text);
    return true;
  });
}

function getInterpolationTexts(
  interpolations: TemplateInterpolation[]
): Interpolation[] {
  return interpolations.flatMap((interpolation) =>
    interpolation.matches.map((match) => ({ text: match.groups[0].trim() }))
  );
}

/**
 * Get the replacement tag for the parent template
 */
const getReplacement = (
  { componentName, config }: Input,
  inputs: Interpolation[]
): string => {
  const attributes = inputs.reduce((acc, input) => {
    return `${acc} [${input.text}]="${input.text}"`;
  }, "");
  return `<${config.defaultPrefix}-${componentName}${attributes}></${config.defaultPrefix}-${componentName}>`;
};

/**
 * FileChange for the new component's HTML template
 */
const getComponentTemplateChange = ({
  directory,
  componentName,
  selectedText,
}: Input): FileChange => {
  return {
    content: selectedText,
    path: path.join(
      directory,
      componentName,
      `${componentName}.component.html`
    ),
    type: "replace",
  };
};

/**
 * FileChange for the new component's style file.
 * If the parent had associated styles, they are written as a starting point.
 */
const getComponentStyleChange = (
  { directory, componentName, associatedStyles }: Input,
  styleExt: StyleExtension
): FileChange => {
  return {
    content: associatedStyles ?? "",
    path: path.join(
      directory,
      componentName,
      `${componentName}.component.${styleExt}`
    ),
    type: "replace",
  };
};

const getComponentTypeScriptChange = (
  { directory, componentName }: Input,
  inputs: Interpolation[]
): FileChange => {
  return {
    newContent: (content: string) => {
      const tsHandler = new TSComponentHandler(content);
      inputs.forEach((input) => tsHandler.addInput(input.text));
      return tsHandler.stringify();
    },
    path: path.join(directory, componentName, `${componentName}.component.ts`),
    type: "update",
  };
};
