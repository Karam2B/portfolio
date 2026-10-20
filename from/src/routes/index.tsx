import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { floatShapes } from "~/components/floating-shapes/floating-shapes";

export default component$(() => {
  const stage = useSignal<HTMLDivElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (stage.value) cleanup(floatShapes(stage.value));
  });

  return (
    <div class="stage" ref={stage}>
      <div class="canvas">
        <main class="hero">
          <h1>Hi 👋, My Name is Karam</h1>
          <p>I'm full-stack developer based in the bay area</p>
        </main>
        <div class="blob blob--gold" aria-hidden="true">
          <div class="blob__aura" />
          <div class="blob__aura" />
          <div class="blob__aura" />
          <img
            class="blob__halo"
            src="/golden_glow.png"
            alt=""
            width={1695}
            height={928}
          />
          <div class="blob__glass" />
          <img
            class="blob__body"
            src="/golden_glow.png"
            alt=""
            width={1695}
            height={928}
          />
        </div>
        <div class="blob blob--mint" aria-hidden="true">
          <div class="blob__aura" />
          <div class="blob__aura" />
          <div class="blob__aura" />
          <img
            class="blob__halo"
            src="/mint_glow.png"
            alt=""
            width={1695}
            height={928}
          />
          <div class="blob__glass" />
          <img
            class="blob__body"
            src="/mint_glow.png"
            alt=""
            width={1695}
            height={928}
          />
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Karam",
  meta: [
    {
      name: "description",
      content: "Hi, my name is Karam",
    },
  ],
  links: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap",
    },
  ],
};
