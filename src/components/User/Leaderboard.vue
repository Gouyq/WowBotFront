<template>
  <b-container class="mt-5">
    <b-row>
      <b-col cols="12">
        <h4 class="mb-3">
          <i class="fas fa-medal"></i>
          Leaderboard
          <b-button variant="outline-primary" class="float-right" @click="$refs.table.refresh()">
            <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
          </b-button>
        </h4>
      </b-col>
      <b-col cols="12">
        <b-table striped bordered hover head-variant="light" :fields="fields" :items="users" ref="table"
                 :per-page="perPage"
                 :current-page="currentPage" show-empty responsive="sm">

          <template v-slot:cell(discord)="row">
            <router-link :to="{name: 'user-show', params: {id: row.item._id}}">
              {{ row.item.username }}#{{ row.item.discriminator }}
            </router-link>
          </template>

          <template v-slot:cell(bank.currentAmount)="row">
            {{ numberWithSpaces(row.item.bank.currentAmount) }}
          </template>

          <template v-slot:cell(bank.totalAmount)="row">
            {{ numberWithSpaces(row.item.bank.totalAmount) }}
          </template>

          <template v-slot:cell(index)="row">
            # {{ row.index + 1 + (currentPage - 1) * perPage }}
          </template>

          <template v-slot:empty>
            <h6 class="text-center">Aucun Utilisateur trouvé !</h6>
          </template>
        </b-table>

        <b-pagination v-model="currentPage" :total-rows="total" :per-page="perPage"></b-pagination>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  export default {
    data () {
      return {
        currentPage: 1,
        total: 0,
        perPage: 50,
        fields: [
          {key: 'index', label: 'Rank'},
          {key: 'discord', label: 'Discord'},
          {key: 'nickname', label: 'Personnage'},
          {key: 'bank.currentAmount', label: 'Courant'},
          {key: 'bank.totalAmount', label: 'Total'}
        ],
        users: this.usersProvider
      }
    },
    methods: {
      usersProvider (ctx) {
        return window.axios
          .get('/api/users', {params: {page: ctx.currentPage}})
          .then(response => {
            const data = response.data

            this.currentPage = data.page
            this.total = data.totalDocs
            this.perPage = data.limit

            return data.data
          })
          .catch(error => {
            console.error(error.response.data.message)
            return []
          })
      }
    }
  }
</script>
