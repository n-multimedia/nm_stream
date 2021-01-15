<template>
  <div>
    <stream-list v-if="containerNID > 0" :containernid="containerNID"></stream-list>
    <stream-list-aggregated v-else></stream-list-aggregated>
  </div>
</template>
<script>
import StreamList from "@/components/views/StreamList";
import StreamListAggregated from "@/components/views/StreamListAggregated";
import {mapState} from "vuex";

export default {
  name: 'Stream',
  components: {
    StreamListAggregated,
    StreamList
  },
  computed: mapState([
    'containerNID'
  ]),
  beforeMount: function () {
    if (this.$root.$el.attributes['data-container-nid']) {
      let containerNID = this.$root.$el.attributes['data-container-nid'].value
      this.$store.commit('setcontainerNID', containerNID)
    }
  },
}
</script>


<style scoped lang="scss">
</style>

<style lang="scss">

</style>
