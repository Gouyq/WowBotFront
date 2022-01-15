<template>
  <b-container class="mt-5">
    <b-row>
      <b-col cols="12">
        <h4 class="mb-3">
          <i class="fas fa-coins"></i>
          Balances
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

          <template v-slot:cell(actions)="row">
            <b-button size="sm" variant="primary" class="ml-1 mr-1 text-white" v-b-tooltip.hover
                      title="Modifier la balance"
                      v-b-modal.modal-update-balance-user @click="updateBalance(row.item)">
              <b-icon-cash></b-icon-cash>
            </b-button>
            <b-button size="sm" variant="success" v-b-tooltip.hover title="Marquer comme payé"
                      v-if="row.item.bank.currentAmount > 0"
                      @click="payOut(row.item)">
              <b-icon-check-circle></b-icon-check-circle>
            </b-button>
          </template>

          <template v-slot:empty>
            <h6 class="text-center">Aucun Utilisateur trouvé !</h6>
          </template>
        </b-table>

        <b-pagination v-model="currentPage" :total-rows="total" :per-page="perPage"></b-pagination>
      </b-col>
    </b-row>

    <b-modal id="modal-update-balance-user" centered title="Modifier la balance"
             @hidden="resetForm"
             @ok.prevent="submitBalance">
      <b-form @submit.prevent="submitBalance">
        <b-form-group label="Courant">
          <b-form-input v-model="form.amount" type="number" required
                        placeholder="-1000, 1000"></b-form-input>
          <b-form-invalid-feedback :state="getError(errors, 'amount') === undefined">
            {{ getError(errors, 'amount') ? getError(errors, 'amount').msg : '' }}
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="Description">
          <b-form-input v-model="form.description" type="text" required
                        placeholder="Raid, Boost..."></b-form-input>
          <b-form-invalid-feedback :state="getError(errors, 'description') === undefined">
            {{ getError(errors, 'description') ? getError(errors, 'description').msg : '' }}
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form>
    </b-modal>
  </b-container>
</template>

<script>
  export default {
    data () {
      return {
        currentPage: 1,
        total: 0,
        perPage: 20,
        errors: [],
        user: null,
        fields: [
          {key: 'discord', label: 'Discord'},
          {key: 'nickname', label: 'Personnage'},
          {key: 'bank.currentAmount', label: 'Courant'},
          {key: 'bank.totalAmount', label: 'Total'},
          {key: 'actions', label: 'Actions'}
        ],
        form: {
          amount: null,
          description: null
        },
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
      },
      updateBalance (user) {
        this.user = user
      },
      submitBalance () {
        this.errors = []

        window.axios.post(`/api/users/${this.user._id}/updateBalance`, this.form)
            .then(() => {
              this.$refs.table.refresh()
              this.$bvModal.hide('modal-update-balance-user')
            })
            .catch(error => {
              if (error.response.status === 422) {
                this.errors = error.response.data.errors
              }
            })
      },
      payOut (user) {
        window.axios.post(`/api/users/${user._id}/pay`)
          .then(() => {
            this.$refs.table.refresh()
          })
          .catch(console.error)
      },
      resetForm () {
        this.form = {
          amount: null,
          description: null
        }
      }
    }
  }
</script>
