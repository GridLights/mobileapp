const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "/journeys",
        component: () => import("src/pages/JourneysPage.vue"),
      },
      {
        path: "/sequencer",
        component: () => import("src/pages/SequencerPage.vue"),
      },
      {
        path: "/randomizer",
        component: () => import("src/pages/RandomizerPage.vue"),
      },
      {
        path: "/settings",
        component: () => import("src/pages/SettingsPage.vue"),
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
