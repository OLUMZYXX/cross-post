import app from "./app.js";
import { connectDB } from "./config/database.js";
import { PORT } from "./config/env.js";
import { startScheduler } from "./services/scheduler.js";

connectDB().then(() => {
  startScheduler();
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
