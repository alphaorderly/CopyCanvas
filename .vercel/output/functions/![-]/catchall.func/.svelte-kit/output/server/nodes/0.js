

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.DKiMAHcb.js","_app/immutable/chunks/BjQCWAVw.js","_app/immutable/chunks/Cp_4kO81.js","_app/immutable/chunks/CBgXpfKl.js"];
export const stylesheets = [];
export const fonts = [];
