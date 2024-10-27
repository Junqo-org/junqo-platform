<!-- omit in toc -->
# Contributing to Junqo-platform

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued.
See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution.
It will make it a lot easier for us maintainers and smooth out the experience for all involved.
The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
>
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

<!-- omit in toc -->
## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
    - [Before Submitting a Bug Report](#before-submitting-a-bug-report)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
    - [From An Issue](#from-an-issue)
  - [Improving The Documentation](#improving-the-documentation)
- [Styleguides](#styleguides)
  - [Branch Naming Convention](#branch-naming-convention)
  - [Commit Message Convention](#commit-message-convention)
- [Join The Project Team](#join-the-project-team)

## Code of Conduct

This project and everyone participating in it is governed by the
[Junqo-platform Code of Conduct](https://github.com/Junqo-org/Junqo-platform/blob/main/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to admins.

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](https://github.com/Junqo-org/Junqo-platform/blob/main/docs/index.md).

Before you ask a question, it is best to search for existing [Issues](https://github.com/Junqo-org/Junqo-platform/issues) that might help you.
In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/Junqo-org/Junqo-platform/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

## I Want To Contribute

> ### Legal Notice
>
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information.
Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report.
Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the [documentation](https://github.com/Junqo-org/Junqo-platform/main/docs/index.md). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](https://github.com/Junqo-org/Junqo-platform/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Possibly your input and the output
  - Can you reliably reproduce the issue? And can you also reproduce it with older versions?

<!-- omit in toc -->
#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public.
> Instead if you think you have found a security issue please contact an administrator via a private communication channel.

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/Junqo-org/Junqo-platform/issues/new).
- Use the template provided in the issue form or the following [link](https://github.com/Junqo-org/Junqo-platform/issues/new?assignees=&labels=bug&projects=&template=bug-report.yml&title=%5BBUG%5D+-+%3Ctitle%3E).
  The template will guide you through the information we need to investigate the issue. Please fill out the template as completely as possible.
  The information you provide will help us to resolve the issue faster.
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own.
  This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps.
  If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`.
  Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Junqo-platform, **including completely new features and minor improvements to existing functionality**.
Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

<!-- omit in toc -->
#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the [documentation](https://github.com/Junqo-org/Junqo-platform/blob/main/docs/index.md) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/Junqo-org/Junqo-platform/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature.
  Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

<!-- omit in toc -->
#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/Junqo-org/Junqo-platform/issues).

- Use the template provided in the issue form or the following [link](https://github.com/Junqo-org/Junqo-platform/issues/new?assignees=&labels=enhancement&projects=&template=feature.yml&title=%5BREQUEST%5D+-+Title).
  The template will guide you through the information we need to investigate the suggestion.
  Please fill out the template as completely as possible.
  The information you provide will help us to resolve the issue faster.
- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to.
  You can use [this tool](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
- **Explain why this enhancement would be useful** to most Junqo-platform users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

### Your First Code Contribution

#### From An Issue

- Create a branch following the [branch naming convention](#branch-naming-convention).
- You should incrementally add commits to the branch as you make progress.
  This helps reviewers understand your thought process as they review the code.
  It also makes it easier for you to fix mistakes or add missed tests during the review process.
  The commits should follow the [commit message convention](#commit-message-convention).
- Once your changes satisfy the issue and you are ready for review, create a pull request from your branch to the `dev` branch or the mother branch of your feature branch.
  The pull request should follow the [pull request template](https://github.com/Junqo-org/Junqo-platform/blob/main/.github/pull_request_template.md).
  The pull request will be reviewed by the project team.
  If there are any concerns, you will be notified and possibly asked to make changes to your pull request.
  If your pull request is accepted, it will be merged into the `dev` branch or the mother branch of your feature branch.

### Improving The Documentation

- Create a branch following the [branch naming convention](#branch-naming-convention).
- You should incrementally add commits to the branch as you make progress.
  This helps reviewers understand your thought process as they review the code.
  It also makes it easier for you to fix mistakes or add missed tests during the review process.
  The commits should follow the [commit message convention](#commit-message-convention).
- Once your changes satisfy the issue and you are ready for review, create a pull request from your branch to the `dev` branch or the mother branch of your feature branch.
  The pull request should follow the template given at creation. You need to fill it before sending the pull request.
  The pull request will be reviewed by the project team.
  If there are any concerns, you will be notified and possibly asked to make changes to your pull request.
  If your pull request is accepted, it will be merged into the `dev` branch or the mother branch of your feature branch.

## Styleguides

### Branch Naming Convention

A set of rules for git branch names have been defined.
This leads to more readable branch names that are easy to follow when looking through the project history.
The branch describes the part of the project you are working on, the issue id and the name of the issue.
We strongly recommend you to create a branch directly from the issue you are working on.
The branch name should be structured as follows:

- Name of the branch

  ```md
  ISSUE-KEY-name-of-the-branch
  ```

ex:

```bash
git checkout -b 12-move-from-jira-to-github-project
```

### Commit Message Convention

A set of rules for git commit messages have been defined.  
This leads to more readable messages that are easy to follow when looking through the project history. But also, it allows to generate a changelog from the commit messages.
Every commit message should consist of a **header** and a **body**.  
The header describe the part of the project you are working on and the action you are doing.
The body contain a more detailed description of the commit.
The commit message should be structured as follows:

- Name of the commit

  ```md
  ISSUE-KEY: Verb ...
  ```

- Description of the commit

  ```md
   - Detailed description of the changes
   - Detailed description of the changes
  ```

ex:

```md
JRA-123: Add miroring
- Add workflow file
```

## Join The Project Team

If you are interested in joining the project team, please open an issue in the project's issue tracker indicating your interest and any relevant experience or contributions you have made.
A project administrator will review your request and get in touch with you through the issue.

<!-- omit in toc -->
## Attribution

This guide is based on the **contributing-gen**. [View contributing-gen](https://github.com/bttger/contributing-gen)!
