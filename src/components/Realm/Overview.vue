<template>
  <b-container class="mt-5">
    <b-row>
      <b-col cols="12">
        <b-card title="Banque globale"
                body-class="text-center">
          <b-card-text v-if="realm">
            <b-row align-h="center" align-v="center">
              <b-col md="3" sm="12">
                <h5>Courant</h5>
                <div>
                  <b class="mr-1">{{ numberWithSpaces(realm.bank.currentAmount) }}</b>
                  <img src="/images/gold.png" alt="gold" style="width: 15px;">
                </div>
              </b-col>
              <b-col md="3" sm="12">
                <h5>Total</h5>
                <div>
                  <b class="mr-1">{{ numberWithSpaces(realm.bank.totalAmount) }}</b>
                  <img src="/images/gold.png" alt="gold" style="width: 15px;">
                </div>
              </b-col>
            </b-row>
          </b-card-text>
          <b-card-text v-else>
            <b-spinner variant="primary" style="width: 5rem; height: 5rem;" label="Large Spinner"></b-spinner>
            <h4 class="text-primary m-3">Chargement...</h4>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col cols="12">
        <h4 class="mb-3">
          <b-icon-cash></b-icon-cash>
          Historique
          <b-button variant="outline-primary" class="float-right" @click="$refs.table.refresh()">
            <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
          </b-button>
        </h4>
      </b-col>
      <b-col cols="12">
        <b-table striped bordered hover head-variant="light" :fields="fields" :items="transactions"
                 ref="table"
                 :per-page="pagination.perPage"
                 :current-page="pagination.currentPage" show-empty responsive="sm">

          <template v-slot:cell(date)="row">
            <span v-b-tooltip.hover :title="formatDate(row.item.createdAt, 'DD/MM/YYYY HH:mm:ss')">
              {{ formatDate(row.item.createdAt) }}
            </span>
          </template>

          <template v-slot:cell(author)="row">
            <router-link :to="{name: 'user-show', params: {id: row.item.author._id}}"
                         v-b-tooltip.hover :title="`${row.item.author.username}#${row.item.author.discriminator}`"
                         v-if="row.item.author">
              {{ row.item.author.nickname }}
            </router-link>
          </template>

          <template v-slot:cell(description)="row">
            {{ row.item.description ? row.item.description : '-' }}
          </template>

          <template v-slot:cell(target)="row">
            <router-link :to="{name: 'admin-realm-show', params: {id: row.item.target._id}}"
                         v-b-tooltip.hover :title="row.item.target.name">
              {{ row.item.target.name }}
            </router-link>
          </template>

          <template v-slot:cell(amount)="row">
            <b-badge variant="success" v-if="row.item.type === 0">
              + {{ numberWithSpaces(row.item.amount) }}
            </b-badge>
            <b-badge variant="danger" v-if="row.item.type === 1">
              - {{ numberWithSpaces(row.item.amount) }}
            </b-badge>
            <b-badge variant="warning" v-if="row.item.type === 2">
              = {{ numberWithSpaces(row.item.amount) }}
            </b-badge>
          </template>

          <template v-slot:empty>
            <h6 class="text-center">Aucune Opération trouvée !</h6>
          </template>
        </b-table>

        <b-pagination v-model="pagination.currentPage" :total-rows="pagination.total"
                      :per-page="pagination.perPage"></b-pagination>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  export default {
    data () {
      return {
        realm: null,
        pagination: {
          perPage: 20,
          currentPage: 1,
          total: 20
        },
        fields: [
          {key: 'date', label: 'Date'},
          {key: 'author', label: 'Origine'},
          {key: 'target', label: 'Serveur'},
          {key: 'description', label: 'Description'},
          {key: 'amount', label: 'Montant'},
        ],
        transactions: this.transactionsProvider,
      }
    },
    mounted () {
      this.getBank()
    },
    methods: {
      getBank () {
        window.axios
          .get('/api/realms/overview')
          .then(response => {
            this.realm = response.data.data
          })
      },
      transactionsProvider (ctx) {
        return window.axios
          .get(`api/realms/transactions`, {params: {page: ctx.currentPage}})
          .then(response => {
            const data = response.data

            this.pagination.currentPage = data.page
            this.pagination.total = data.totalDocs
            this.pagination.perPage = data.limit

            return data.data
          })
          .catch(() => {
            return []
          })
      },
    }
  }
</script>
