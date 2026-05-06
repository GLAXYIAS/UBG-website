export const games = [
  {
    id: "slope",
    title: "Slope",
    url: "Games/slope/index.html",
    desc: "Avoid obstacles in this 3D runner.",
    tags: ["3D", "Action"]
  }
];

export function getMostPopular() {
    return games.slice(0, 1);
}
