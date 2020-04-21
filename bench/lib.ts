import * as process from 'process';

import { MultiBar, Presets, SingleBar } from 'cli-progress';
import * as commandLineArgs from 'command-line-args';

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

const optionDefinitions = [
  {
    name: 'include-measure',
    alias: 'm',
    type: String,
    multiple: true,
    defaultValue: <string[]>[],
  },
  {
    name: 'exclude-measure',
    alias: 'M',
    type: String,
    multiple: true,
    defaultValue: <string[]>[],
  },
  {
    name: 'include-suite',
    alias: 's',
    type: String,
    multiple: true,
    defaultValue: <string[]>[],
  },
  {
    name: 'exclude-suite',
    alias: 'S',
    type: String,
    multiple: true,
    defaultValue: <string[]>[],
  },
];

type CommandLineOptions = {
  includeSuite: string[];
  excludeSuite: string[];
  includeMeasure: string[];
  excludeMeasure: string[];
};

export type Suite = {
  name: string;
  run: (
    bar: SingleBar,
    commandLineOptions: CommandLineOptions
  ) => Promise<SuiteResult>;
};

export type SuiteResult = {
  name: string;
  measures: MeasureResult[];
};

export type Measure = {
  name: string;
  run: (
    bar: SingleBar,
    commandLineOptions: CommandLineOptions
  ) => Promise<MeasureResult>;
};

export type MeasureResult = {
  name: string;
  average: number;
  maximum: number;
  minimum: number;
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

function filterByPatterns<E extends { name: string }>(
  values: E[],
  patterns: string[],
  keepIfMatches: boolean
): E[] {
  if (patterns.length == 0) {
    return values;
  }
  return values.filter(({ name }) => {
    for (const pattern of patterns) {
      if (name.match(pattern)) {
        return keepIfMatches;
      }
    }
    return !keepIfMatches;
  });
}

export async function benchmark(...suites: Suite[]) {
  const progress = new SingleBar(
    {
      clearOnComplete: true,
      format: `{status} {suite} - {measure} [suite: {suiteValue}/{suiteTotal}, measure: {measureValue}/{measureTotal}, test: {value}/{total}] ...`,
    },
    Presets.shades_grey
  );
  const options = <CommandLineOptions>(
    commandLineArgs(optionDefinitions, { camelCase: true })
  );
  suites = filterByPatterns(suites, options.includeSuite, true);
  suites = filterByPatterns(suites, options.excludeSuite, false);
  progress.start(0, 0, {
    status: 'Initializing',
    suiteTotal: suites.length,
    suiteValue: 1,
    measureTotal: 0,
    measureValue: 0,
    suite: '',
    measure: '',
  });
  const results: SuiteResult[] = [];
  for (let i = 0; i < suites.length; i++) {
    results.push(await suites[i].run(progress, options));
    progress.update(null, { suiteValue: i + 2 });
  }
  progress.stop();
  for (let { name, measures } of results) {
    console.log(`${name}`);
    for (let {
      name,
      average,
      maximum,
      minimum,
      standardDeviation,
    } of measures) {
      console.log(`  ${name}`);
      console.log(`    Average: ${formatTime(average)}`);
      console.log(`    Std Dev: ${formatTime(standardDeviation)}`);
      console.log(`    Maximum: ${formatTime(maximum)}`);
      console.log(`    Minimum: ${formatTime(minimum)}`);
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
    run: async (progress, commandLineOptions) => {
      const { includeMeasure, excludeMeasure } = commandLineOptions;
      measures = filterByPatterns(measures, includeMeasure, true);
      measures = filterByPatterns(measures, excludeMeasure, false);
      const results: MeasureResult[] = [];
      progress.update(null, {
        suite: name,
        measureTotal: measures.length,
        measureValue: 1,
      });
      for (let i = 0; i < measures.length; i++) {
        results.push(await measures[i].run(progress, commandLineOptions));
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
    run: async (progress, commandLineOptions) => {
      options = { ...defaultOptions, ...options };
      const errorResults = {
        name,
        average: NaN,
        maximum: NaN,
        minimum: NaN,
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
      return {
        name,
        average,
        maximum: Math.max(...measures),
        minimum: Math.min(...measures),
        standardDeviation,
      };
    },
  };
}
