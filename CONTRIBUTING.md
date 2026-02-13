# Contributing to WildFly Documentation

Welcome to the WildFly Documentation project! This repository provides much of the content that is visible at https://docs.wildfly.org. The content is published using GitHub Pages.

We welcome contributions from the community. This guide will walk you through the steps for getting started on our project.

- [Legal](#legal)
- [Primary Sources](#primary-sources)
- [Documentation Federation](#documentation-federation)
- [Issues](#issues)
  - [Good First Issues](#good-first-issues)
- [Forking the Project](#forking-the-project)
- [Setting up your Developer Environment](#setting-up-your-developer-environment)
- [Contributing Guidelines](#contributing-guidelines)

## Legal

All contributions to this repository are licensed under the [Apache License](https://www.apache.org/licenses/LICENSE-2.0), version 2.0 or later, or, if another license is specified as governing the file or directory being modified, such other license.

All contributions are subject to the [Developer Certificate of Origin (DCO)](https://developercertificate.org/).
The DCO text is also included verbatim in the [dco.txt](dco.txt) file in the root directory of the repository.

### Compliance with Laws and Regulations

All contributions must comply with applicable laws and regulations, including U.S. export control and sanctions restrictions.
For background, see the Linux Foundation’s guidance:
[Navigating Global Regulations and Open Source: US OFAC Sanctions](https://www.linuxfoundation.org/blog/navigating-global-regulations-and-open-source-us-ofac-sanctions).

## Primary Sources

The primary source for most of the content in this repository is maintained in other repositories, particularly in the [main WildFly repository](https://github.com/wildfly/wildfly),
where Asciidoc content is maintained in the [docs directory](https://github.com/wildfly/wildfly/tree/main/docs). Creation of HTML content from those primary sources is done by building
those other repositories, and then the generated HTML is added to this repository.

If you wish to change something in one of the HTML files that are created that way, you will likely be asked to also make a change in the primary source in the repository where it is maintained. This ensures
that your change is carried forward into later versions of the documentation. 
To make a change to primary sources, please go to the primary source repository and following the instructions in its CONTRIBUTING.md file -- 
for example https://github.com/wildfly/wildfly/blob/main/CONTRIBUTING.md for information on contributing changes to the [main appserver docs content](https://github.com/wildfly/wildfly/tree/main/docs).

## Documentation Federation

A significant amount of the content on https://docs.wildfly.org is not provided by this repository. 
Instead it comes from some other repository in the [wildfly GitHub organization](https://github.com/wildfly) that also uses GitHub Pages, 
but whic configures GitHub Pages to publish its content to a subdirectory of https://docs.wildfly.org.

If you see a URL with a top-level directory where you cannot find a corresponding source folder in this repository, 
that means that content is coming from another repository whose name matches the name of the top-level directory.
For example, the https://docs.wildfly.org/wildfly-proposals/ content comes from https://github.com/wildfly/wildfly-proposals.

If you wish to make a change to that kind of content, please go to the federated repository and following the instructions in its CONTRIBUTING.md file.


## Issues

The WildFly Documentation project uses GitHub Issues to manage issues for this repository. All issues can be found [here](https://github.com/wildfly/wildfly.github.io/issues).

To create a new issue, comment on an existing issue, or assign an issue to yourself, you'll need to first [create a GitHub account](https://github.com/signup).

Once you have selected an issue you'd like to work on, make sure it's not already assigned to someone else.
Before beginning work on an issue, it's good to start a thread in the [wildfly-developers channel in Zulip](https://wildfly.zulipchat.com/#narrow/channel/174184-wildfly-developers) to let others know what you'll be doing.


### Good First Issues
Want to contribute to the WildFly Documentation project but aren't quite sure where to start? Look for issues with the `good first issue` label. These are a triaged set of issues that are great for getting started on our project. These can be found [here](https://github.com/wildfly/wildfly.github.io/pulls?q=is%3Aopen+is%3Apr+label%3A%22good+first+issue%22).


## Forking the Project
To contribute, you will first need to fork the [wildfly.github.io](https://github.com/wildfly/wildfly.github.io) repository.

This can be done by looking in the top-right corner of the repository page and clicking "Fork".

The next step is to clone your newly forked repository onto your local workspace. This can be done by going to your newly forked repository, which should be at `https://github.com/USERNAME/wildfly.github.io`.

Then, there will be a green button that says "Code". Click on that and copy the URL.

Then, in your terminal, paste the following command:
```bash
git clone [URL]
```
Be sure to replace [URL] with the URL that you copied.

Now you have the repository on your computer!

## Setting up your Developer Environment

First `cd` to the directory where you cloned the project (eg: `cd wildfly.github.io`)

Add a remote ref to upstream, for pulling future updates.
For example:

```
git remote add upstream https://github.com/wildfly/wildfly.github.io
```

It is recommended that you use a separate branch for every issue you work on. To keep things straightforward and memorable, you can name each branch using the GitHub issue number. This way, you can have multiple PRs open for different issues.
```bash
git checkout -b Issue_9999
```

To build `wildfly.github.io` run:
```bash
mvn clean install
```

To skip the tests, use:

```bash
mvn clean install -DskipTests=true
```

To run only a specific test, use:

```bash
mvn clean install -Dtest=TestClassName
```

## Contributing Guidelines

When submitting a PR, please keep the following guidelines in mind:

1. In general, it's good practice to squash all of your commits into a single commit. For larger changes, it's ok to have multiple meaningful commits. If you need help with squashing your commits, feel free to ask us how to do this on your pull request. We're more than happy to help!

  1. Please include the GitHub issue you worked on in the title of your pull request and in your commit message. For example, for issue [999](https://github.com/wildfly/wildfly.github.io/issues/999), the PR title and commit message should be `[Issue_999] Create a testcase which verifies behaviour of the foo`.

2. Please include the link to the GitHub issue you worked on in the description of the pull request. For example, if your PR adds a fix for [999](https://github.com/wildfly/wildfly.github.io/issues/999), the PR description should contain a link to https://github.com/wildfly/wildfly.github.io/issues/999.
