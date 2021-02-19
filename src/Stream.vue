<template>
  <div id="stream-wrapper">
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


<style scoped lang="scss">
@import "../node_modules/bootstrap/scss/_functions.scss";
@import "../node_modules/bootstrap/scss/_variables.scss";
@import "./assets/scss/bootstrap_custom.scss";

::v-deep {
    @import "../node_modules/bootstrap/scss/bootstrap.scss";
    //customize bootstrap to match okl
    @import "../node_modules/bootstrap/scss/bootstrap-grid.scss";
    @import "../node_modules/bootstrap/scss/bootstrap-reboot.scss";
    @import "../node_modules/bootstrap/scss/card.scss";
    @import "../node_modules/bootstrap/scss/alert.scss";
    @import "../node_modules/bootstrap/scss/dropdown.scss";
    @import "../node_modules/bootstrap/scss/modal.scss";
    @import "../node_modules/bootstrap/scss/buttons.scss";
}

</style>

<style lang="scss">

#stream-wrapper {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}


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


#stream-list .card {
  padding: 1em;
  margin-bottom: 1em;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
#stream-list .slide-fade-enter-active {
  transition: all .1s ease;
}

#stream-list .slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

#stream-list .slide-fade-enter, #stream-list .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */
{
  transform: translateX(10px);
  opacity: 0;
}

#stream-list .list-item {
  display: inline-block;
  margin-right: 10px;
}

#stream-list .list-enter-active, #stream-list .list-leave-active {
  transition: all 1s;
}

#stream-list .list-enter, #stream-list .list-leave-to /* .list-leave-active below version 2.1.8 */
{
  opacity: 0;
  transform: translateY(30px);
}

/**
Flipping
 */
#stream-list .card-flip {
  perspective: 100vw;

  &.flip-active .flip,
  &.flip-active .flip {
    transform: rotateY(180deg);
  }
}

#stream-list .card-flip,
#stream-list .front,
#stream-list .back-delete,
#stream-list .back-edit {
  width: 100%;
  // height: 480px;
}

#stream-list .back-delete {
  button {
    margin-left: 10px;
  }
}

#stream-list .flip {
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

#stream-list .front,
#stream-list .back-delete,
#stream-list .back-edit {
  backface-visibility: hidden;
  // position: absolute;
  // top: 0;
  // left: 0;
}

#stream-list .back-delete,
#stream-list .back-edit {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
}

#stream-list .front {
  z-index: 2;
  transform: rotateY(0deg);
}

#stream-list .back-delete,
#stream-list .back-edit {
  transform: rotateY(180deg);
}

#stream-list .stream-post-wrapper .v-spinner {
  position: absolute;
}

#stream-list *:focus {
  outline-width: 0px;
}

#stream-list {
  .load-more-wrapper {
    text-align: right;
    button {
      border: 0;
      background: none;
      color:  #337ab7;
      &:hover, &:active, &:focus {
        text-decoration: underline;
        color: #2c3e50;
      }
    }
  }
}

</style>
