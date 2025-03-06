/*
    Useful for closing dropdowns, modals, etc. when clicking outside of them.

    How to use:
    <div v-click-outside="handleClickOutside">
        <button>Click me</button>
    </div>
*/

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("click-outside", {
    beforeMount(el, binding) {
      el.clickOutsideEvent = function (event: MouseEvent) {
        if (!(el === event.target || el.contains(event.target))) {
          binding.value(event);
        }
      };
      document.addEventListener("click", el.clickOutsideEvent);
    },
    unmounted(el) {
      document.removeEventListener("click", el.clickOutsideEvent);
    },
  });
});
