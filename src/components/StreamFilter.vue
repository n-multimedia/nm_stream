<template>
    <form class="stream-filter-form">
        <div class="row">
            <div class="col">
                <input type="text" class="stream-filter-context form-control" :placeholder="$t('filter.placeholder.context')">
            </div>
            <div class="col">
                <input type="text" class="stream-filter-username form-control" :placeholder="$t('filter.placeholder.username')">
            </div>
            <div class="col">
                <input type="text" class="stream-filter-privacy form-control" :placeholder="$t('filter.placeholder.privacy')">
            </div>
            <div class="col"><button>Filter</button></div>
        </div>
    </form>
</template>

<script>
  export default {
    name: 'StreamFilter'
  }
</script>

<style scoped lang="scss">
    .stream-filter-form {
        margin-bottom: 15px;
    }

    .stream-filter-form {
        .col:first-child,
        .col:last-child {
            padding: 0;
        }
    }
</style>
