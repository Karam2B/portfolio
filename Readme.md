# Welcome to my portfolio website!

This website is built with Qwik and SQLite.

# Tech Stack

My Website is structured as follows:

Infrastructure: I use Terraform to manage and connect different parts of the cloud in one place
Web deployment: I use Vercel to deploy the website, I like their RPC/server functions and its free.
Database: I use Turso, a SQLite-compatible database.
Storage: I use AWS S3 to store the media files.
Frontend: I use Qwik, its serialization approach helps with performance and SEO of the website by using a server-side rendering. And it gives me full control over where and when JavaScript is executed.
Admin: I edit content at the same place as my website, protected by a Google OAuth and JWT token.

# Source layout (`qwik/src`)

Routes are pages. They load data and compose UI; they do not contain SQL.

| Path | What belongs there |
| --- | --- |
| `routes/` | File-based pages, `routeLoader$`, `routeAction$` |
| `components/ui/` | Reusable primitives: links, buttons, form fields, images |
| `components/blog/` | Blog page chrome |
| `components/project/` | Project cards |
| `components/markdown/` | Markdown parse, render, and admin editor |
| `components/layout/` | Site shell: background, head, grids |
| `components/home/` | Home-page blobs |
| `hooks/` | Browser-only Qwik hooks |
| `lib/` | Pure helpers that run on server or browser |
| `server/db/` | **All SQL**, one file per table (`projects.ts`, `blogs.ts`) |
| `server/` | Other server-only code: `auth.ts`, `media.ts` |
| `experimental/` | Unused experiments |

The same map is in the comment at the top of `qwik/src/root.tsx`.
