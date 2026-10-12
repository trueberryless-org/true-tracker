## Time Tracker

[![Netlify Status](https://api.netlify.com/api/v1/badges/d0f3fc08-770b-47a2-a25d-49286fbfb12d/deploy-status)](https://app.netlify.com/projects/true-tracker/deploys)

[Time Tracker](https://time-tracker.space) allows you to track your time spent on different projects. To further organize your projects there are also this thing called "tasks" which are basically subfolders of projects with extra features.

## Features

The key features of this software are listed below:

- **Privacy**:
  Without an account, all data is only stored locally, which means that nothing is shared via the internet. When you sign in with your ATproto account, your data is stored in a private space in your own repository, so you keep full ownership of it.

- **Your data, everywhere**:
  Sign in with your Bluesky or any other [ATproto](https://atproto.com) account to use Time Tracker on every device. Data you already tracked on this device is copied to your account on the first sign-in.

- **OSS**:
  The whole source code is completely open source which means that everybody can look into it and improve the code we are developing.

- **Clean design**:
  Thanks to the wonderful [shadcn/ui](https://ui.shadcn.com/) design and [Reka UI](https://reka-ui.com/) the website looks clean and minimalistic with consistent design through and through.

## Development

Time Tracker is a [Nuxt](https://nuxt.com) app. The ATproto integration is built with [airspace](https://getair.space).

```sh
pnpm install
pnpm dev
```

| Command                 | Description                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| `pnpm dev`              | Starts the development server on `http://127.0.0.1:3000`.                         |
| `pnpm build`            | Builds the app for production.                                                    |
| `pnpm test`             | Runs the unit tests.                                                              |
| `pnpm check:all`        | Runs formatting, linting, type, unused code and unit test checks.                 |
| `pnpm contrast:build`   | Regenerates `app/assets/css/contrast.css` after changing a theme in `themes.css`. |
| `pnpm lexicons:build`   | Writes the `space.time-tracker.*` lexicon documents to `./lexicons`.              |
| `pnpm lexicons:publish` | Publishes the lexicons for the identity in `AUTHORITY_IDENTITY`.                  |

### ATproto

The OAuth client metadata is served dynamically at `/oauth-client-metadata.json` for the origin of each request, so production, deploy previews and local development all work without configuration. Locally, the app uses a loopback client, so signing in works on `http://127.0.0.1:3000`.

All records live in the `space.time-tracker` namespace:

| Collection                    | Description                                                      |
| ----------------------------- | ---------------------------------------------------------------- |
| `space.time-tracker.project`  | A project. The record key is the project identifier.             |
| `space.time-tracker.task`     | A task, pointing to its project.                                 |
| `space.time-tracker.session`  | A tracked session, pointing to its task.                         |
| `space.time-tracker.visit`    | One visit of the app, shown in the visits chart.                 |
| `space.time-tracker.settings` | Display name, profile picture, theme and automation preferences. |
| `space.time-tracker.vault`    | The private space holding all of the collections above.          |

When a PDS does not support permissioned spaces yet, or the account did not grant access to the private space, your data stays on your device until you explicitly choose to store it as public records. You can stop storing it publicly again at any time, which deletes the public records.

### Publishing lexicons

Permissioned spaces only work once the `space.time-tracker.*` lexicons are published and resolvable. They are published to the account that the `_lexicon.time-tracker.space` DNS TXT record points to (`did=<did of that account>`). After changing [`shared/atproto/lexicons.ts`](shared/atproto/lexicons.ts):

```sh
export AUTHORITY_IDENTITY=time-tracker.space
export AIRSPACE_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
pnpm lexicons:plan
pnpm lexicons:publish
```

`lexicons:plan` builds the JSON into `lexicons/` and shows what would be created or updated without writing anything; it does not need the app password. `lexicons:publish` writes the changes.

## Star History

<a href="https://star-history.com/#trueberryless-org/true-tracker&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=trueberryless-org/true-tracker&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=trueberryless-org/true-tracker&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=trueberryless-org/true-tracker&type=Date" />
 </picture>
</a>

## License

Licensed under the MIT license, Copyright © trueberryless.

See [LICENSE](/LICENSE) for more information.
