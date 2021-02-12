<template>
  <div>
    <stream-list v-if="containerNID > 0" :containernid="containerNID" :aggregated="false"></stream-list>
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
    } else {
      this.$store.commit('setcontainerNID', 0)
    }
  },
}
</script>


<style lang="scss">

@import "../node_modules/bootstrap/scss/_functions.scss";
@import "../node_modules/bootstrap/scss/_variables.scss";
//customize bootstrap to match okl
@import "./assets/scss/bootstrap_custom.scss";
@import "../node_modules/bootstrap/scss/bootstrap.scss";
@import "../node_modules/bootstrap/scss/bootstrap-grid.scss";
@import "../node_modules/bootstrap/scss/bootstrap-reboot.scss";
@import "../node_modules/bootstrap/scss/card.scss";
@import "../node_modules/bootstrap/scss/alert.scss";
@import "../node_modules/bootstrap/scss/dropdown.scss";
@import "../node_modules/bootstrap/scss/modal.scss";
@import "../node_modules/bootstrap/scss/buttons.scss";


#bv-modal-delete-attachment.fade {
  opacity: initial;
}

#bv-modal-delete-attachment___BV_modal_outer_ .modal-backdrop {
  opacity: 0.5;
}

#bv-modal-delete-attachment #bv-modal-delete-attachment___BV_modal_header_ .close {
  position: absolute;
  top: 15px;
  right: 15px;
}


</style>
