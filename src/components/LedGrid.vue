//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// LedGrid.vue
//
// LED Polygone grind of LEDs Component
//
// Author: Tavis Hord - tavis@sideburn.com
// Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <div class="svg-container">
    <svg width="200" height="200">
      <!-- polygon bg -->
      <polygon
        :points="getHexagonPoints()"
        fill="green"
        stroke="black"
        stroke-width="3"
      />
      <!-- LEDs -->
      <g v-for="(row, rowIndex) in rows" :key="rowIndex">
        <circle
          v-for="(color, colIndex) in row"
          :key="colIndex"
          :cx="getCircleX(rowIndex, colIndex)"
          :cy="getCircleY(rowIndex)"
          :r="circleRadius"
          :fill="color"
        />
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    rows: {
      type: Array,
      required: true,
    },
    circleRadius: {
      type: Number,
      default: 4,
    },
    spacing: {
      type: Number,
      default: 20,
    },
  },
  methods: {
    //get current led x position
    getCircleX(rowIndex, colIndex) {
      const totalWidth = this.rows[rowIndex].length * this.spacing;
      const offset = (200 - totalWidth) / 2; // center offset

      return colIndex * this.spacing + offset + 9; // margin
    },

    //get current led y position
    getCircleY(rowIndex) {
      // vertical center offset
      const totalHeight = this.rows.length * this.spacing;
      const offset = (200 - totalHeight) / 2; // offset based on SVG height

      return rowIndex * this.spacing + offset + 9; // margin
    },

    //get potitioning points for bg polygon based on led grid
    getHexagonPoints() {
      const points = [];

      const centerX = 100;
      const centerY = 100;

      const radius =
        Math.max(
          (this.rows.length * this.spacing) / 2,
          (this.rows[0].length * this.spacing) / 2
        ) + 15; // + 15 margin...

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }

      return points.join(" ");
    },
  },
};
</script>

<style scoped>
.svg-container {
  display: flex;
  justify-content: center; /* center horizontally */
  align-items: center; /* center vertically */
  border: 1px solid #888;
  border-radius: 4px;
}

svg {
  display: block; /* no extra space below SVG */
}
</style>
