/*
    Enable touch gestures (swipes) for elements.
    Useful for navigation, such as swiping to switch between tabs, etc.

    How to use:
    <div v-swipe="{
        up: () => {
            console.log("up");
        },  
        down: () => {
            console.log("down");
        },
        left: () => {
            console.log("left");
        },
        right: () => {
            console.log("right");
        },
    }">
        <button>Click me</button>
    </div>
*/

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("swipe", {
    mounted(el, binding) {
      const touchStartX = ref(0);
      const touchEndX = ref(0);
      const touchStartY = ref(0);
      const touchEndY = ref(0);

      el.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          touchStartX.value = e.changedTouches[0].screenX;
          touchStartY.value = e.changedTouches[0].screenY;
        },
        { passive: true }
      );

      el.addEventListener(
        "touchend",
        (e: TouchEvent) => {
          touchEndX.value = e.changedTouches[0].screenX;
          touchEndY.value = e.changedTouches[0].screenY;

          const deltaX = touchEndX.value - touchStartX.value;
          const deltaY = touchEndY.value - touchStartY.value;

          // Determine if horizontal swipe
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0 && binding.value.right) {
              binding.value.right();
            } else if (deltaX < 0 && binding.value.left) {
              binding.value.left();
            }
          }

          // Determine if vertical swipe
          if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
            if (deltaY > 0 && binding.value.down) {
              binding.value.down();
            } else if (deltaY < 0 && binding.value.up) {
              binding.value.up();
            }
          }
        },
        { passive: true }
      );
    },
  });
});
