import * as process from 'process';

import { MultiBar, Presets, SingleBar } from 'cli-progress';

export type Test = () => Promise<() => Promise<void>>;

export type Options = {
  maxTime: number;
  targetTestCount: number;
  skipCount: number;
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
  maxTime: 10,
  targetTestCount: 100,
  skipCount: 0,
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
    progress.update(i);
    results.push(await measures[i].run(multibar));
  }
  multibar.stop();
  for (let { name, average, standardDeviation } of results) {
    console.log(`${name}`);
    console.log(`  Average: ${formatTime(average)}`);
    console.log(`  Std Dev: ${formatTime(standardDeviation)}`);
  }
}

export function measure(
  name: string,
  setup: Test,
  options: Partial<Options> = {}
): Measure {
  return {
    name,
    run: async (multibar) => {
      options = { ...defaultOptions, ...options };

      const progress = multibar.create(options.targetTestCount, 0, {
        title: name,
      });

      const measureStart = process.hrtime.bigint();
      const measures = [];
      let testNumber = 0;
      while (
        process.hrtime.bigint() - measureStart <= options.maxTime * 1e9 &&
        testNumber < options.targetTestCount
      ) {
        const test = await setup();
        const testStart = process.hrtime.bigint();
        await test();
        const testEnd = process.hrtime.bigint();
        measures.push(Number(testEnd - testStart));
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
