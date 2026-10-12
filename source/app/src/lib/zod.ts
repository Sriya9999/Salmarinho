// zod, configured once for the whole app. Import z from here, never from "zod".
// jitless: zod otherwise probes for eval with `new Function`, which the site's
// Content-Security-Policy blocks and browsers log as a security violation.
import { z } from "zod";

z.config({ jitless: true });

export { z };
