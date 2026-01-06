export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.CcgERLhV.js",app:"_app/immutable/entry/app.B6Vog5ja.js",imports:["_app/immutable/entry/start.CcgERLhV.js","_app/immutable/chunks/CMipn2xu.js","_app/immutable/chunks/Cp_4kO81.js","_app/immutable/chunks/BoEA9AZ-.js","_app/immutable/entry/app.B6Vog5ja.js","_app/immutable/chunks/Cp_4kO81.js","_app/immutable/chunks/BJKfEL1q.js","_app/immutable/chunks/BjQCWAVw.js","_app/immutable/chunks/BoEA9AZ-.js","_app/immutable/chunks/Dm8-tuVz.js","_app/immutable/chunks/CBgXpfKl.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
