import * as process from 'process';

import { MultiBar, Presets, SingleBar } from 'cli-progress';

export type Test = () => Promise<() => Promise<void>>;

export type Options = {
  /**
   * The maximum amount of time the cumulative test runs are allowed to take.
   * This does not include setup time.
   */
  maxTime: number;

  /**
   * The target number of test executions per-measurement. As long as total
   * test execution time is less than maxTime tests will be run until this
   * number of tests have been executed.
   */
  targetTestCount: number;

  /**
   * The number of initial runs to throw away. Sometimes the first test can take
   * extra long because of warm up or things like turn reaping when using a
   * shared setup.
   */
  skipCount: number;

  /**
   * If true the setup routine is only executed once. By default the setup is
   * run anew for each test execution.
   *
   * This can be useful if the test setup is very expensive. However, care
   * should be taken when writing tests that use a shared setup not to mutate
   * state in a way that would invalidate test results.
   */
  sharedSetup: boolean;
};

export type Measure = {
  name: string;
  run: (bar: MultiBar) => Promise<Result>;
};

export type Result = {
  name: string;
  average: number;
  standardDeviation: number;
};

export const defaultOptions: Options = {
  maxTime: 60,
  targetTestCount: 100,
  skipCount: 0,
  sharedSetup: false,
};

function formatTime(nanoSeconds: number) {
  if (nanoSeconds <= 1e3) {
    return `${nanoSeconds} ns`;
  }
  if (nanoSeconds <= 1e6) {
    return `${(nanoSeconds / 1e3).toFixed(3)} μs`;
  }
  if (nanoSeconds <= 1e9) {
    return `${(nanoSeconds / 1e6).toFixed(3)} ms`;
  }
  return `${(nanoSeconds / 1e9).toFixed(3)} s`;
}

/**
 * Defines and executes a suite of benchmark measurements. Measurements are
 * created with the measure method.
 */
export async function suite(name: string, ...measures: Measure[]) {
  const multibar = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: `{bar} {percentage}% | {title} | ETA: {eta}s | {value}/{total}`,
    },
    Presets.shades_grey
  );
  const progress = multibar.create(measures.length, 0, { title: 'Overall' });
  const results: Result[] = [];
  for (let i = 0; i < measures.length; i++) {
    results.push(await measures[i].run(multibar));
    progress.update(i + 1);
  }
  multibar.stop();
  for (let { name, average, standardDeviation } of results) {
    console.log(`${name}`);
    console.log(`  Average: ${formatTime(average)}`);
    console.log(`  Std Dev: ${formatTime(standardDeviation)}`);
  }
}

/**
 * Defines a single measurement. Measurements are asynchronous and have an
 * asynchronous setup.
 *
 * Setup and tests are run serially.
 */
export function measure(
  name: string,
  setup: Test,
  options: Partial<Options> = {}
): Measure {
  return {
    name,
    run: async (multibar) => {
      options = { ...defaultOptions, ...options };
      const errorResults = {
        name,
        average: NaN,
        standardDeviation: NaN,
      };

      const progress = multibar.create(
        options.targetTestCount + options.skipCount,
        0,
        {
          title: name,
        }
      );

      let elapsedTime = BigInt(0);
      const measures = [];
      let testNumber = 0;
      let test: () => Promise<void>;
      while (
        elapsedTime <= options.maxTime * 1e9 &&
        testNumber < options.targetTestCount + options.skipCount
      ) {
        if (!test || !options.sharedSetup) {
          try {
            test = await setup();
          } catch (e) {
            console.log(e);
            return errorResults;
          }
        }
        const testStart = process.hrtime.bigint();
        try {
          await test();
        } catch (e) {
          console.log(e);
          return errorResults;
        }
        const testEnd = process.hrtime.bigint();
        const testTime = testEnd - testStart;
        elapsedTime += testTime;
        if (testNumber >= options.skipCount) {
          measures.push(Number(testTime));
        }
        testNumber++;
        progress.update(testNumber);
      }
      progress.stop();
      const sum = (l: number[]) => l.reduce((a, b) => a + b);
      const average = sum(measures) / measures.length;
      const standardDeviation = Math.sqrt(
        sum(measures.map((x) => Math.pow(x - average, 2))) /
          (measures.length - 1)
      );
      return { name, average, standardDeviation };
    },
  };
}
