<template>
  <b-container class="mt-5">
    <b-row>
      <b-col cols="12">
        <b-card body-class="text-center">

          <b-card-title v-if="booster">
            {{ `${booster.user.username}#${booster.user.discriminator}` }}

            <a href="#" @click.prevent="impersonateUser(booster.user._id)"
               v-if="isGranted('ROLE_ADMIN') && booster.user._id !== user._id">
              <b-icon-person-fill></b-icon-person-fill>
            </a>
          </b-card-title>

          <b-card-text v-if="booster">
            <b-row align-h="center">
              <b-badge v-for="role in booster.user.roles" :key="role" class="m-2"
                       :style="{backgroundColor: rolesColor[role].color, lineHeight: '20px', minWidth: '50px'}">
                {{ rolesColor[role].label }}
              </b-badge>
            </b-row>
            <b-row align-h="center" align-v="center">
              <b-col md="3" sm="12">
                <h5>Courant</h5>
                <div>
                  <b class="mr-1">{{ numberWithSpaces(booster.user.bank.currentAmount) }}</b>
                  <img src="/images/gold.png" alt="gold" style="width: 15px;">
                </div>
              </b-col>
              <b-col md="3" sm="12">
                <h5>Total</h5>
                <div>
                  <b class="mr-1">{{ numberWithSpaces(booster.user.bank.totalAmount) }}</b>
                  <img src="/images/gold.png" alt="gold" style="width: 15px;">
                </div>
              </b-col>
            </b-row>
            <b-row align-h="center" align-v="center">
              <b-col md="3" sm="12">
                <img src="/images/tank.png" alt="tank" style="width: 40px;">
                <h3>{{ booster.stats.tankCount }}</h3>
              </b-col>
              <b-col md="3" sm="12">
                <img src="/images/healer.png" alt="healer" style="width: 40px;">
                <h3>{{ booster.stats.healerCount }}</h3>
              </b-col>
              <b-col md="3" sm="12">
                <img src="/images/dps.png" alt="dps" style="width: 40px;">
                <h3>{{ booster.stats.dpsCount }}</h3>
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
      <b-col cols="12" align="center">
        <b-button-group size="md">
          <b-button variant="outline-info" :pressed="currentTab === 1" @click="currentTab = 1">Boosts</b-button>
          <b-button variant="outline-success" :pressed="currentTab === 2" @click="currentTab = 2">Historique</b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row class="mt-3" v-show="currentTab === 1">
      <b-col cols="12">
        <h4 class="mb-3">
          <i class="fab fa-accessible-icon"></i>
          Boosts terminés
          <b-button variant="outline-primary" class="float-right" @click="$refs.boostTable.refresh()">
            <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
          </b-button>
        </h4>
      </b-col>
      <b-col cols="12">
        <b-table striped bordered hover head-variant="light" :fields="boostFields" :items="boosts" ref="boostTable"
                 :per-page="boostPagination.perPage"
                 :current-page="boostPagination.currentPage" show-empty responsive="sm">
          <template v-slot:cell(id)="row">
            {{ row.item._id.substr(0, 8) }}
          </template>

          <template v-slot:cell(date)="row">
            <p v-b-tooltip.hover :title="formatDate(row.item.createdAt, 'DD/MM/YYYY HH:mm:ss')">{{
              formatDate(row.item.createdAt) }}</p>
          </template>

          <template v-slot:cell(tank)="row">
            <b-badge variant="success" v-if="booster && booster.user._id === row.item.tank._id">
              {{ row.item.tank.nickname }}
            </b-badge>
            <template v-else>
              <router-link :to="{name: 'user-show', params: {id: row.item.tank._id}}"
                           v-b-tooltip.hover :title="`${row.item.tank.username}#${row.item.tank.discriminator}`"
                           v-if="isGranted('ROLE_ADMIN')">
                {{ row.item.tank.nickname }}
              </router-link>
              <p v-else>{{ row.item.tank.nickname }}</p>
            </template>
          </template>

          <template v-slot:cell(healer)="row">
            <b-badge variant="success" v-if="booster && booster.user._id === row.item.healer._id">
              {{ row.item.healer.nickname }}
            </b-badge>
            <template v-else>
              <router-link :to="{name: 'user-show', params: {id: row.item.healer._id}}"
                           v-b-tooltip.hover :title="`${row.item.healer.username}#${row.item.healer.discriminator}`"
                           v-if="isGranted('ROLE_ADMIN')">
                {{ row.item.healer.nickname }}
              </router-link>
              <p v-else>{{ row.item.healer.nickname }}</p>
            </template>
          </template>

          <template v-slot:cell(dps1)="row">
            <b-badge variant="success" v-if="booster && booster.user._id === row.item.dps1._id">
              {{ row.item.dps1.nickname }}
            </b-badge>
            <template v-else>
              <router-link :to="{name: 'user-show', params: {id: row.item.dps1._id}}"
                           v-b-tooltip.hover :title="`${row.item.dps1.username}#${row.item.dps1.discriminator}`"
                           v-if="isGranted('ROLE_ADMIN')">
                {{ row.item.dps1.nickname }}
              </router-link>
              <p v-else>{{ row.item.dps1.nickname }}</p>
            </template>
          </template>

          <template v-slot:cell(dps2)="row">
            <b-badge variant="success" v-if="booster && booster.user._id === row.item.dps2._id">
              {{ row.item.dps2.nickname }}
            </b-badge>
            <template v-else>
              <router-link :to="{name: 'user-show', params: {id: row.item.dps2._id}}"
                           v-b-tooltip.hover :title="`${row.item.dps2.username}#${row.item.dps1.discriminator}`"
                           v-if="isGranted('ROLE_ADMIN')">
                {{ row.item.dps2.nickname }}
              </router-link>
              <p v-else>{{ row.item.dps2.nickname }}</p>
            </template>
          </template>

          <template v-slot:cell(cutBooster)="row">
            <b-badge variant="success"
                     v-if="booster && [row.item.tank._id, row.item.healer._id, row.item.dps1._id, row.item.dps2._id].includes(booster.user._id)">
              {{ numberWithSpaces(row.item.cutBooster) }}
            </b-badge>
            <template v-else>{{ numberWithSpaces(row.item.cutBooster) }}</template>
          </template>

          <template v-slot:cell(cutAdvertiser)="row">
            <b-badge variant="success" v-if="booster && booster.user._id === row.item.advertiser._id">
              {{ numberWithSpaces(row.item.cutAdvertiser) }}
            </b-badge>
            <template v-else>{{ numberWithSpaces(row.item.cutAdvertiser) }}</template>
          </template>

          <template v-slot:empty>
            <h6 class="text-center">Aucun Boost trouvé !</h6>
          </template>
        </b-table>

        <b-pagination v-model="boostPagination.currentPage" :total-rows="boostPagination.total"
                      :per-page="boostPagination.perPage"></b-pagination>
      </b-col>
    </b-row>
    <b-row class="mt-3" v-show="currentTab === 2">
      <b-col cols="12">
        <h4 class="mb-3">
          <b-icon-cash></b-icon-cash>
          Historique
          <b-button variant="outline-primary" class="float-right" @click="$refs.transactionTable.refresh()">
            <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
          </b-button>
        </h4>
      </b-col>
      <b-col cols="12">
        <b-table striped bordered hover head-variant="light" :fields="transactionFields" :items="transactions"
                 ref="transactionTable"
                 :per-page="transactionPagination.perPage"
                 :current-page="transactionPagination.currentPage" show-empty responsive="sm">

          <template v-slot:cell(date)="row">
            <span v-b-tooltip.hover :title="formatDate(row.item.createdAt, 'DD/MM/YYYY HH:mm:ss')">
              {{ formatDate(row.item.createdAt) }}
            </span>
          </template>

          <template v-slot:cell(author)="row">
            <router-link :to="{name: 'user-show', params: {id: row.item.author._id}}"
                         v-b-tooltip.hover :title="`${row.item.author.username}#${row.item.author.discriminator}`"
                         v-if="row.item.author && isGranted('ROLE_ADMIN')">
              {{ row.item.author.nickname }}
            </router-link>
            <p v-if="row.item.author && !isGranted('ROLE_ADMIN')">{{ row.item.author.nickname }}</p>
          </template>

          <template v-slot:cell(description)="row">
            {{ row.item.description ? row.item.description : '-' }}
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

        <b-pagination v-model="transactionPagination.currentPage" :total-rows="transactionPagination.total"
                      :per-page="transactionPagination.perPage"></b-pagination>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import {mapActions} from 'vuex'

  export default {
    data () {
      return {
        currentTab: 1,
        booster: null,
        boostPagination: {
          perPage: 20,
          currentPage: 1,
          total: 20
        },
        boostFields: [
          {key: 'id', label: '#'},
          {key: 'date', label: 'Date'},
          {key: 'tank', label: 'Tank'},
          {key: 'healer', label: 'Healer'},
          {key: 'dps1', label: 'DPS 1'},
          {key: 'dps2', label: 'DPS 2'},
          {key: 'cutBooster', label: 'Cut Booster'},
          {key: 'cutAdvertiser', label: 'Cut Advertiser'},
        ],
        boosts: this.userBoostsProvider,
        transactionPagination: {
          perPage: 20,
          currentPage: 1,
          total: 20
        },
        transactionFields: [
          {key: 'date', label: 'Date'},
          {key: 'author', label: 'Origine'},
          {key: 'description', label: 'Description'},
          {key: 'amount', label: 'Montant'},
        ],
        transactions: this.transactionsProvider,
        rolesColor: {
          'ROLE_ADMIN': {
            label: 'Admin',
            color: '#007bff'
          },
          'ROLE_ADVERTISER': {
            label: 'Advertiser',
            color: '#6610f2'
          },
          'ROLE_ADVERTISER_RARE': {
            label: 'Advertiser Rare',
            color: '#56fa31'
          },
          'ROLE_ADVERTISER_LEGENDARY': {
            label: 'Advertiser Legendary',
            color: '#f24e48'
          },
          'ROLE_BOOSTER': {
            label: 'Booster',
            color: '#6f42c1'
          },
          'ROLE_MAIL': {
            label: 'Maille',
            color: '#e83e8c'
          },
          'ROLE_PLATE': {
            label: 'Plaque',
            color: '#fd7e14'
          },
          'ROLE_CLOTH': {
            label: 'Tissu',
            color: '#dc3545'
          },
          'ROLE_LEATHER': {
            label: 'Cuir',
            color: '#ffc107'
          },
          'ROLE_TANK': {
            label: 'Tank',
            color: '#28a745'
          },
          'ROLE_HEALER': {
            label: 'Healer',
            color: '#20c997'
          },
          'ROLE_DPS': {
            label: 'Dps',
            color: '#17a2b8'
          },
          'ROLE_STAFF': {
            label: 'Staff',
            color: '#212529'
          }
        }
      }
    },
    beforeRouteUpdate (to, from, next) {
      next()
      this.getUser()
      this.$refs.boostTable.refresh()
      this.$refs.transactionTable.refresh()
    },
    mounted () {
      this.getUser()
    },
    methods: {
      ...mapActions('auth', [
        'impersonate'
      ]),
      impersonateUser (userId) {
        this
          .impersonate(userId)
          .then(() => {
            this.$router.push({name: 'home'})
          })
      },
      getUser () {
        return window.axios
          .get('/api/users/' + this.$route.params.id)
          .then(response => {
            this.booster = response.data.data
          })
          .catch(() => {
            this.$router.push({name: 'home'})
          })
      },
      transactionsProvider (ctx) {
        return window.axios
          .get(`api/users/${this.$route.params.id}/transactions`, {params: {page: ctx.currentPage}})
          .then(response => {
            const data = response.data

            this.transactionPagination.currentPage = data.page
            this.transactionPagination.total = data.totalDocs
            this.transactionPagination.perPage = data.limit

            return data.data
          })
          .catch(() => {
            return []
          })
      },
      userBoostsProvider (ctx) {
        return window.axios
          .get(`api/users/${this.$route.params.id}/boosts`, {params: {page: ctx.currentPage}})
          .then(response => {
            const data = response.data

            this.boostPagination.currentPage = data.page
            this.boostPagination.total = data.totalDocs
            this.boostPagination.perPage = data.limit

            return data.data
          })
          .catch(() => {
            return []
          })
      }
    }
  }
</script>
