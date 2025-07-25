<template>
  <div class="smart-playlist-rule-group relative p-4 rounded-md border border-white/15">
    <h4 class="mb-3">
      <span>
        <template v-if="isFirstGroup">
          Include songs that match <strong>all</strong> of these criteria
        </template>
        <template v-else>
          or <strong>all</strong> of these criteria
        </template>
      </span>
    </h4>

    <div class="space-y-2 mb-2">
      <Rule
        v-for="rule in mutatedGroup.rules"
        :key="rule.id"
        :rule="rule"
        @input="onRuleChanged"
        @remove="removeRule(rule)"
      />
    </div>

    <div class="text-center absolute w-full left-0 -mt-[2px]">
      <Btn
        class="add-rule-btn aspect-square scale-75 hover:scale-90 active:scale-[80%]"
        rounded
        small
        success
        title="Add more rules"
        @click.prevent="addRule"
      >
        <Icon :icon="faPlus" />
      </Btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { defineAsyncComponent, reactive, toRefs } from 'vue'
import { playlistStore } from '@/stores/playlistStore'

const props = defineProps<{ group: SmartPlaylistRuleGroup, isFirstGroup: boolean }>()
const emit = defineEmits<{ (e: 'input', group: SmartPlaylistRuleGroup): void }>()

const { group, isFirstGroup } = toRefs(props)

const Btn = defineAsyncComponent(() => import('@/components/ui/form/Btn.vue'))
const Rule = defineAsyncComponent(() => import('@/components/playlist/smart-playlist/SmartPlaylistRule.vue'))

const mutatedGroup = reactive<SmartPlaylistRuleGroup>(JSON.parse(JSON.stringify(group.value)))

const notifyParentForUpdate = () => emit('input', mutatedGroup)

const addRule = () => mutatedGroup.rules.push(playlistStore.createEmptySmartPlaylistRule())

const onRuleChanged = (data: SmartPlaylistRule) => {
  Object.assign(mutatedGroup.rules.find(({ id }) => id === data.id)!, data)
  notifyParentForUpdate()
}

const removeRule = (rule: SmartPlaylistRule) => {
  mutatedGroup.rules = mutatedGroup.rules.filter(({ id }) => id !== rule.id)
  notifyParentForUpdate()
}
</script>
