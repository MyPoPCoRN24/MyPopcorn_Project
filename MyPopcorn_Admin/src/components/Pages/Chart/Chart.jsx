import React, { useRef, useEffect } from "react";
import * as echarts from "echarts";

const Chart = ({ chartData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    // Data and total calculation
    const data = chartData?.map((item) => item?.percentage);
    const options = chartData?.map((item) => item?.option);
    const total = data?.reduce((sum, value) => sum + value, 0);

    const maxLabelWidth = 70; // Max width in pixels

    // Function to truncate labels
    const truncateLabel = (label) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = "12px Arial"; // Use the same font as in the chart
      const labelWidth = context.measureText(label).width;

      if (labelWidth > maxLabelWidth) {
        let truncatedLabel = label;
        while (
          context.measureText(truncatedLabel + "...").width > maxLabelWidth
        ) {
          truncatedLabel = truncatedLabel.slice(0, -1);
        }
        return truncatedLabel + "...";
      }
      return label;
    };

    const option = {
      title: {
        // text: 'World Population'
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params) => {
          let tooltipText = "";
          params.forEach((param) => {
            const percentage = (param.value / total) * 100;
            tooltipText += `${param.name}: ${percentage.toFixed(2)}%<br/>`;
          });
          return tooltipText;
        },
      },
      legend: {
        show: false,
      },
      grid: {
        left: "1%",
        right: "4%",
        bottom: "3%",
        top: "1%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: (value) => value.toLocaleString(),
        },
      },
      yAxis: {
        type: "category",
        data: options,
        axisLabel: {
          formatter: (value) => truncateLabel(value),
          // align: 'center',
        },
      },
      series: [
        {
          type: "bar",
          data: data,
          itemStyle: {
            color: "#FAB216", // Custom color for bars
          },
          barWidth: "20px", // Set the width of the bars
          label: {
            show: true,
            position: "insideRight",
            formatter: (params) => {
              const percentage = Math.round((params.value / total) * 100); // Round to nearest whole number
              return percentage > 1 ? `${percentage}%` : ""; // Show only if percentage > 1
            },
          },
          barCategoryGap: "5%",
        },
      ],
    };

    chartInstance.setOption(option);

    // Resize chart on window resize
    window.addEventListener("resize", () => {
      chartInstance.resize();
    });

    return () => {
      window.removeEventListener("resize", () => {
        chartInstance.resize();
      });
      chartInstance.dispose();
    };
  }, [chartData]);

  return <div ref={chartRef} style={{ width: "100%", height: "200px" }} />;
};

export default Chart;
