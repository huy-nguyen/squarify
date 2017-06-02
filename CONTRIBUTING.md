# Contributing
Thanks for being willing to contribute!

## Project setup

Before starting development, you'll need to have the following software installed on your machine:
- `node` v7 and above with `npm` v4. If not, follow the instructions [here](https://nodejs.org/en/download/current/).
- `yarn` package manager. If not, follow the installation instructions [here](https://yarnpkg.com/lang/en/docs/install/).
- `nps` task runner, a simple wrapper around `npm scripts`. If not, run `yarn global add nps`.

After that, set up the project as follows:

1. Clone the repo.
1. `cd` into project directory and install all the project's dependencies by running `yarn`.
1. `nps validate` to make sure you've got it working.

Other things you can do:
- To make a production build, run `nps build`. The output are in the following directories:
  - `dist` contains the UMD build for `script` tags in browser.
  - `lib` contains the CommonJS build suitable for `node`.
  - `es` contains the untranspiled, ES2015 module build suitable for `webpack`.
- To run tests, run `nps test`.
- To get a list of all available commands, run `nps` with no arguments.

## Making commits

This project follows [a convention](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/mobilebasic) for commit messages. Please follow this convention and keep your commits [atomic](https://www.freshconsulting.com/atomic-commits/).

Once you're ready to commit the changes, add the files to be committed to git's staging area and then run `nps commit`. Follow the instruction of the interactive prompt (please leave `scope` blank). The prompt will ask you the following questions, so please have answers to them before making your commit:
1. Select the type of change that you're committing:
  - **feat**: A new feature
  - **fix**: A bug fix
  - **docs**: Documentation only changes
  - **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  - **refactor**: A code change that neither fixes a bug nor adds a feature
  - **perf**: A code change that improves performance
  - **test**: Adding missing or correcting existing tests
  - **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation.
2. Denote the scope of this change ($location, $browser, $compile, etc.): **Please leave this blank**.
1. Write a short, imperative tense description of the change:
1. Provide a longer description of the change:
1. List any breaking changes.
1. List any issues closed by this change.

Please write a good commit message by following the guidelines (adapted from [here](https://chris.beams.io/posts/git-commit/#seven-rules)):
- Do not end the subject line with a period
- Use the imperative mood in the subject line
- Use the body to explain what and why vs. how
