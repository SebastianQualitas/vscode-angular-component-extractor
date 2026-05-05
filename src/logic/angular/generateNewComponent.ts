import { exec, ExecException } from "child_process";
import { getLogger } from "../../utils/logger";

/**
 * Generate a new Angular component
 * @param useNpx If Angular CLI is not installed on the machine
 * @param componentName Name of the component which will be generated
 * @param componentDirectory Directory of the current component
 * @param style Style extension to use (scss, sass, less, css)
 * @returns Promise that resolves if the component has beed created successfully
 */
export const generateNewComponent = (
  useNpx: boolean,
  componentName: string,
  componentDirectory: string,
  style: string = "css"
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const logger = getLogger().getChildLogger({
      label: "generateNewComponent",
    });

    const command =
      (useNpx ? "npx -p @angular/cli " : "") +
      `ng generate component ${componentName} --style=${style}`;

    logger.debug(`execute the following command: ${command}`);
    exec(
      command,
      { cwd: componentDirectory },
      (err: ExecException | null, stdout: string, stderr: string) => {
        logger.info("stdout: " + stdout);
        if (stderr) {
          logger.error(stderr);
        }

        if (err) {
          logger.fatal("error: " + err);
          reject(err);
        }

        return resolve();
      }
    );
  });
};
