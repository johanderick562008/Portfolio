import { Suspense, createElement, lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Selective hydration for below-the-fold sections.
 *
 * The prerender renders every section into the HTML (entry-server.tsx registers
 * them here). In the browser, each deferred section is its own chunk inside a
 * <Suspense> boundary: React keeps the prerendered HTML as-is and hydrates the
 * section in its own small task once the chunk arrives, instead of hydrating the
 * whole page in one long task.
 */
const registry: Record<string, ComponentType> = {};
const lazies: Record<string, LazyExoticComponent<ComponentType>> = {};

export function registerSection(name: string, component: ComponentType) {
  registry[name] = component;
}

export function Deferred({ name, load }: { name: string; load: () => Promise<ComponentType> }) {
  const Section = registry[name] ?? (lazies[name] ??= lazy(() => load().then((c) => ({ default: c }))));
  return createElement(Suspense, { fallback: null }, createElement(Section));
}

/** For `load` on the server, where every section is already registered. */
export const noLoad = () => Promise.reject(new Error("sections are registered statically on the server"));
