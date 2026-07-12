// Production environment — used when running `ng build` (Docker / deployed build)
// The browser runs on the host machine, so it still reaches the backend
// via the host-mapped port (localhost:5000).
// When deploying to a real server, replace this with the actual backend URL.
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:5000'
};
