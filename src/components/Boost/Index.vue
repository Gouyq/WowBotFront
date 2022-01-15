<template>
  <b-container class="mt-5">
    <b-row>
      <b-col cols="12">
        <h4 class="mb-3">
          <i class="fab fa-accessible-icon"></i>
          Boosts
          <b-button variant="outline-primary" class="float-right" @click="$refs.table.refresh()">
            <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
          </b-button>
        </h4>
      </b-col>

      <b-col cols="12">
        <b-table striped bordered hover head-variant="light" :fields="fields" :items="boosts" ref="table"
                 :per-page="perPage"
                 :current-page="currentPage" show-empty responsive="sm">
          <template v-slot:cell(id)="row">
            {{ row.item._id.substr(0, 8) }}
          </template>

          <template v-slot:cell(date)="row">
            <p v-b-tooltip.hover :title="formatDate(row.item.createdAt, 'DD/MM/YYYY HH:mm:ss')">
              {{ formatDate(row.item.createdAt) }}</p>
          </template>

          <template v-slot:cell(realm)="row">
            <router-link :to="{name: 'admin-realm-show', params: {id: row.item.realm._id}}"
                         v-b-tooltip.hover :title="row.item.realm.name" v-if="row.item.realm">
              {{ row.item.realm.name }}
            </router-link>
          </template>

          <template v-slot:cell(team)="row">
            <div>
              <img src="/images/tank.png" alt="tank" class="mr-1" style="width: 20px;">
              <router-link v-if="row.item.tank" :to="{name: 'user-show', params: {id: row.item.tank._id}}"
                           v-b-tooltip.hover :title="`${row.item.tank.username}#${row.item.tank.discriminator}`">
                {{ row.item.tank.nickname }}
              </router-link>
            </div>
            <div>
              <img src="/images/healer.png" alt="healer" class="mr-1" style="width: 20px;">
              <router-link v-if="row.item.healer" :to="{name: 'user-show', params: {id: row.item.healer._id}}"
                           v-b-tooltip.hover :title="`${row.item.healer.username}#${row.item.healer.discriminator}`">
                {{ row.item.healer.nickname }}
              </router-link>
            </div>
            <div>
              <img src="/images/dps.png" alt="dps" class="mr-1" style="width: 20px;">
              <router-link v-if="row.item.dps1" :to="{name: 'user-show', params: {id: row.item.dps1._id}}"
                           v-b-tooltip.hover :title="`${row.item.dps1.username}#${row.item.dps1.discriminator}`">
                {{ row.item.dps1.nickname }}
              </router-link>
            </div>
            <div>
              <img src="/images/dps.png" alt="dps" class="mr-1" style="width: 20px;">
              <router-link v-if="row.item.dps2" :to="{name: 'user-show', params: {id: row.item.dps2._id}}"
                           v-b-tooltip.hover :title="`${row.item.dps2.username}#${row.item.dps2.discriminator}`">
                {{ row.item.dps2.nickname }}
              </router-link>
            </div>
          </template>

          <template v-slot:cell(advertiser)="row">
            <router-link v-if="row.item.advertiser" :to="{name: 'user-show', params: {id: row.item.advertiser._id}}"
                         v-b-tooltip.hover
                         :title="`${row.item.advertiser.username}#${row.item.advertiser.discriminator}`">
              {{ row.item.advertiser.nickname }}
            </router-link>
          </template>

          <template v-slot:cell(total)="row">
            {{ numberWithSpaces(row.item.total) }}
          </template>

          <template v-slot:cell(cutBooster)="row">
            {{ numberWithSpaces(row.item.cutBooster) }}
          </template>

          <template v-slot:cell(cutAdvertiser)="row">
            {{ numberWithSpaces(row.item.cutAdvertiser) }}
          </template>

          <template v-slot:cell(status)="row">
            <b-badge variant="primary" v-if="row.item.status === 0">Initialisé</b-badge>
            <b-badge variant="warning" v-if="row.item.status === 1">En cours</b-badge>
            <b-badge variant="success" v-if="row.item.status === 2">Terminé</b-badge>
            <b-badge variant="danger" v-if="row.item.status === 3">Annulé</b-badge>
          </template>

          <template v-slot:cell(actions)="row">
            <b-button size="sm" variant="success" class="ml-1 mr-1" v-b-tooltip.hover title="Marquer comme terminé"
                      v-if="row.item.status === 1" @click="complete(row.item)" :disabled="isSending">
              <b-icon-check-circle></b-icon-check-circle>
            </b-button>

            <b-button size="sm" variant="danger" class="ml-1 mr-1" v-b-tooltip.hover title="Annuler le boost"
                      v-if="[0, 1].includes(row.item.status)" @click="cancel(row.item)" :disabled="isSending">
              <b-icon-x-circle></b-icon-x-circle>
            </b-button>
          </template>

          <template v-slot:empty>
            <h6 class="text-center">Aucun Boost trouvé !</h6>
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
        isSending: false,
        fields: [
          {key: 'id', label: '#'},
          {key: 'date', label: 'Date'},
          {key: 'realm', label: 'Serveur'},
          {key: 'team', label: 'Team'},
          {key: 'advertiser', label: 'Advertiser'},
          {key: 'total', label: 'Montant'},
          {key: 'cutBooster', label: 'Cut Booster'},
          {key: 'cutAdvertiser', label: 'Cut Advertiser'},
          {key: 'status', label: 'Statut'},
          {key: 'actions', label: 'Actions'}
        ],
        boosts: this.boostsProvider
      }
    },
    methods: {
      cancel (boost) {
        this.isSending = true

        window.axios.post(`/api/boosts/${boost._id}/cancel`)
          .then(() => {
            this.$refs.table.refresh()
          })
          .catch(console.error)
          .finally(() => {
            this.isSending = false
          })
      },
      complete (boost) {
        this.isSending = true

        window.axios.post(`/api/boosts/${boost._id}/complete`)
          .then(() => {
            this.$refs.table.refresh()
          })
          .catch(console.error)
          .finally(() => {
            this.isSending = false
          })
      },
      boostsProvider (ctx) {
        return window.axios
          .get('/api/boosts', {params: {page: ctx.currentPage}})
          .then(response => {
            const data = response.data

            this.currentPage = data.page
            this.total = data.totalDocs
            this.perPage = data.limit

            return data.data
          })
          .catch(() => {
            return []
          })
      }
    }
  }
</script>
