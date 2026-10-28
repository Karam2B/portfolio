/**
 * Contact and profile links shown on the home page.
 *
 * - `text` doubles as the link's id: `<ProfileLink name="Github">` and the
 *   short URL `/link/github` (see routes/link/[link].tsx) both look links up by it.
 * - Entries with an `Img` icon appear in `<ContactMe>` (home page and `/link`).
 * - An unknown `/link/:slug` redirects to `/link`, which uses the same icons.
 */

import { BsLinkedin, BsGithub } from "@qwikest/icons/bootstrap";
import { SiFreelancer } from "@qwikest/icons/simpleicons";
import { TbMailFilled } from "@qwikest/icons/tablericons";

export const links = [
    {
        text: "Email" as const,
        href: "mailto:kb.karam.barakat@gmail.com",
        Img: TbMailFilled,
    },
    {
        text: "Resume" as const,
        href: "https://docs.google.com/document/d/1IYj2S0_3rv02Aj3KAv2p5dP-4r0lke9MxIVg1ETMtIM",
    },
    {
        text: "Github" as const,
        href: "https://github.com/Karam2B/",
        Img: BsGithub,
    },
    {
        text: "Freelancer" as const,
        href: "https://www.freelancer.com/u/KennethBarakat",
        Img: SiFreelancer,
    },
    {
        text: "LinkedIn" as const,
        href: "https://www.linkedin.com/in/karam-barakat-775931262/",
        Img: BsLinkedin,
    },
];
