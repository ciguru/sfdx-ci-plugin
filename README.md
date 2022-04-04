# Continuous Delivery Engine, based on SFDX CLI

Plugin for [SFDX CLI](https://developer.salesforce.com/tools/sfdxcli) with
[CI Engine](https://www.npmjs.com/package/@ciguru/sfdx-ci-engine) functionality
to automate the [Salesforce CRM](https://salesforce.com) development process.

# Installation

You can install this using [SFDX CLI](https://developer.salesforce.com/tools/sfdxcli) installer.

## Requirements

Install [SFDX CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
v7.142.1 or later.

## Install package

```shell
> sfdx plugins:install @ciguru/sfdx-ci-engine
```

# Usage

## Create configuration file

Create configuration file `configuration.yaml`

```yaml
version: 1.x
inputs:
  - id: scratchName
  - id: devhubName
steps:
  - type: sfdx.force.org.create.scratch
    id: scratch
    alias: $input.scratchName
    devHubUserName: $input.devhubName
    definitionFile: config/sfdx-scratch-def.json
    isNoAncestors: true
    duration: 30
    overrideDefinition:
      adminEmail: test@example.com
```

See [SFDX CI Engine](https://www.npmjs.com/package/@ciguru/sfdx-ci-engine) to find out all supported configurations

## Execute CI

Run command:

```shell
> sfdx ci:run -f configuration.yaml
```

Run to find out all supported options:

```shell
> sfdx ci:run --help
```
