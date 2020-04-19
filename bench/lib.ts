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

export type Suite = {
  name: string;
  run: (bar: SingleBar) => Promise<SuiteResult>;
};

export type SuiteResult = {
  name: string;
  measures: MeasureResult[];
};

export type Measure = {
  name: string;
  run: (bar: SingleBar) => Promise<MeasureResult>;
};

export type MeasureResult = {
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

export async function benchmark(...suites: Suite[]) {
  const progress = new SingleBar(
    {
      clearOnComplete: true,
      format: `{status} {suite} - {measure} [suite: {suiteValue}/{suiteTotal}, measure: {measureValue}/{measureTotal}, test: {value}/{total}] ...`,
    },
    Presets.shades_grey
  );
  progress.start(0, 0, {
    status: 'Initializing',
    suiteTotal: suites.length,
    suiteValue: 1,
  });
  const results: SuiteResult[] = [];
  for (let i = 0; i < suites.length; i++) {
    results.push(await suites[i].run(progress));
    progress.update(null, { suiteValue: i + 2 });
  }
  progress.stop();
  for (let { name, measures } of results) {
    console.log(`${name}`);
    for (let { name, average, standardDeviation } of measures) {
      console.log(`  ${name}`);
      console.log(`    Average: ${formatTime(average)}`);
      console.log(`    Std Dev: ${formatTime(standardDeviation)}`);
    }
  }
}

/**
 * Defines and executes a suite of benchmark measurements. Measurements are
 * created with the measure method.
 */
export function suite(name: string, ...measures: Measure[]): Suite {
  return {
    name,
    run: async (progress) => {
      const results: MeasureResult[] = [];
      progress.update(null, {
        suite: name,
        measureTotal: measures.length,
        measureValue: 1,
      });
      for (let i = 0; i < measures.length; i++) {
        results.push(await measures[i].run(progress));
        progress.update(null, { measureValue: i + 1 });
      }
      return { name, measures: results };
    },
  };
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
    run: async (progress) => {
      options = { ...defaultOptions, ...options };
      const errorResults = {
        name,
        average: NaN,
        standardDeviation: NaN,
      };

      let elapsedTime = BigInt(0);
      const measures = [];
      let testNumber = 0;
      let test: () => Promise<void>;
      progress.setTotal(options.targetTestCount + options.skipCount);
      progress.update(1, { measure: name });
      while (
        elapsedTime <= options.maxTime * 1e9 &&
        testNumber < options.targetTestCount + options.skipCount
      ) {
        if (!test || !options.sharedSetup) {
          try {
            progress.update(null, { status: 'Setting up' });
            test = await setup();
          } catch (e) {
            console.log(e);
            return errorResults;
          }
        }
        const testStart = process.hrtime.bigint();
        try {
          progress.update(null, { status: 'Running' });
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
        progress.update(testNumber + 1);
      }
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
