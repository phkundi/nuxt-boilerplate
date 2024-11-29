<template>
  <div>
    <label
      :for="id"
      class="block text-sm font-medium leading-6 text-primary-text"
    >
      {{ label }}
      <span v-if="optional" class="text-xs text-gray-400">(optional)</span>
    </label>
    <div class="mt-2">
      <component
        :is="
          type === 'textarea'
            ? 'textarea'
            : type === 'select'
            ? 'select'
            : 'input'
        "
        :id="id"
        :name="id"
        :type="type !== 'select' && type !== 'textarea' ? type : undefined"
        :rows="type === 'textarea' ? 4 : undefined"
        :class="[
          'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6',
          validationState.isValid
            ? 'ring-gray-300'
            : 'ring-error focus:ring-error',
        ]"
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        :placeholder="placeholder"
      >
        <template v-if="type === 'select'"> <slot></slot> </template
      ></component>
      <span v-if="!validationState.isValid" class="text-xs text-error">
        {{ validationState.message }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ValidationState {
  isValid: boolean;
  message: string;
}

defineProps({
  id: String,
  label: String,
  type: {
    type: String,
    default: "text",
  },
  modelValue: [String, Number],
  placeholder: String,
  optional: Boolean,
  validationState: {
    type: Object as PropType<ValidationState>,
    required: true,
  },
});

defineEmits(["update:modelValue"]);
</script>
