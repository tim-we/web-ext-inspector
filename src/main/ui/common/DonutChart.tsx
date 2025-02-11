import type { FunctionComponent } from "preact";

type ChartProps = {
  data: {
    amount: number;
    color: string;
  }[];
};

const DonutChart: FunctionComponent<ChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const total = data.map((data) => data.amount).reduce((s, x) => s + x, 0);
  const radius = 40;
  const circumference = Math.ceil(2 * Math.PI * radius);
  let offset = 0;

  return (
    <svg class="donut-chart" viewBox="0 0 100 100" aria-hidden="true">
      {data.map((dp, i) => {
        const size = Math.ceil(circumference * dp.amount / total);
        const angle = Math.round((360 * offset) - 90);
        offset += dp.amount / total;

        return (
          <circle
            // biome-ignore lint/suspicious/noArrayIndexKey: Order does not change
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={dp.color}
            stroke-width="20"
            stroke-dasharray={`${size} ${circumference - size}`}
            transform={`rotate(${angle} 50 50)`}
          />
        );
      })}
    </svg>
  );
};

export default DonutChart;
