import { publicProcedure, router } from '../trpc';
import { helloSchema } from '@crafted/validators';
import { getGreeting, getAllExamples } from '@crafted/services';

export const exampleRouter = router({
  hello: publicProcedure
    .input(helloSchema)
    .query(({ input }) => getGreeting(input)),

  getAll: publicProcedure.query(() => getAllExamples()),
});
