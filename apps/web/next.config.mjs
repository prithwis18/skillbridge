/** @type {import('next').NextConfig} */
// No `output: standalone`: the image keeps the full workspace and runs `next start`,
// so a standalone bundle buys nothing and only warns at boot.
export default { reactStrictMode: true };
