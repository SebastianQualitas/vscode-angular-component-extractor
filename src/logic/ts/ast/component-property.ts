import {
  callExpression,
  ClassProperty,
  classProperty,
  identifier,
} from "@babel/types";

export interface ComponentPropertyData {
  key: string;
}
export interface ComponentPropertyBuilder {
  setKey(key: ComponentPropertyData["key"]): ComponentPropertyBuilder;
  build(): ClassProperty;
}

/**
 * Builds a class property using the Angular signals input() API:
 *   myProp = input();
 *
 * Per .claude/CLAUDE.md: use input() instead of @Input() decorator.
 */
export function componentPropertyBuilder() {
  const propData: Partial<ComponentPropertyData> = {};
  const propBuilder: ComponentPropertyBuilder = {
    setKey(key: string): typeof propBuilder {
      propData.key = key;
      return propBuilder;
    },
    /**
     * Requires that a key was set, otherwise an error is thrown.
     * @returns constructed class property using input() signal
     */
    build(): ClassProperty {
      if (propData.key === undefined) {
        throw new Error("Cannot construct a class property without a key");
      }

      // Generates: myProp = input();
      const initializer = callExpression(identifier("input"), []);

      return classProperty(identifier(propData.key), initializer, null, []);
    },
  };
  return propBuilder;
}
