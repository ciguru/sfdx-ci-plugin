/*******************************************************************************
 * Copyright (c) 2022, Customertimes Software
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';

import CiEngine from '@ciguru/sfdx-ci-engine';
import { JSONSchemaForCTSoftwareSFDXCIConfiguration as SchemaV1 } from '@ciguru/sfdx-ci-engine/dist/lib/schema-v1.0.0';

// Initialize Messages
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@ciguru/sfdx-ci-plugin', 'run');

export class Run extends SfdxCommand {
  protected input: { [id: string]: string | null } = {};

  public static description = messages.getMessage('commandDescription');
  public static examples = messages.getMessage('examples').split(EOL);

  protected static varargs = { required: false };
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = true;

  public static flagsConfig = {
    configurationfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('configurationFileDescription'),
      required: true,
    }),
    noprompt: flags.boolean({
      char: 'n',
      description: messages.getMessage('noPromptDescription'),
      default: false,
    }),
  };

  public static aliases = ['ci:run'];

  public async run(): Promise<any> {
    // Init CI Engine
    const ci = new CiEngine(this.flags.configurationfile);
    this.registerListeners(ci);
    const config: SchemaV1 = await ci.loadSettings();

    // Set inputs
    await this.getInputs(config);
    ci.setGlobalInputs(this.input);

    // Execute
    await ci.run();
    return ci.getOutputs();
  }

  protected registerListeners(ci: CiEngine): void {
    ci.event.on('step_start', (stepId: string) => {
      const data = ci.getStep(stepId);
      if (data) {
        const prefix = `[${data.number + 1}/${data.total}]`;
        const info = data.step.description || `Step ${data.step.id}`;
        this.ux.startSpinner(`${prefix} ${info}`, 'In Progress');
      } else {
        this.ux.startSpinner(`Undefined step`, 'In Progress');
      }
    });
    ci.event.on('step_finish', () => {
      this.ux.stopSpinner('Done');
    });
    ci.event.on('step_error', (message: string) => {
      this.ux.stopSpinner(`Error: ${message}`);
    });
  }

  protected async getInputs(config: SchemaV1): Promise<void> {
    if (config.inputs && config.inputs.length > 0) {
      for (const input of config.inputs) {
        let value: string | undefined;
        const defaultValue = () => {
          if (this.varargs?.[input.id]) {
            return String(this.varargs?.[input.id]);
          }
          if (input.default) {
            return String(input.default);
          }
          return undefined;
        };
        if (this.flags.noprompt) {
          value = defaultValue();
        } else {
          value = await this.ux.prompt(input.description || input.id, {
            required: input.required,
            default: defaultValue(),
            type: 'normal',
            timeout: undefined,
          });
        }
        if (input.required && !value) {
          throw new SfdxError(`Missed required value for input ID: '${input.id}'`);
        } else {
          this.input[input.id] = value || null;
        }
      }
    }
  }
}
