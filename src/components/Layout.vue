<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand :to="{name: 'home'}">
        BOT
      </b-navbar-brand>

      <div class="m-auto" v-if="isAuthenticated && isGranted('ROLE_ADMIN') && isMobile">
        <b-nav-form>
          <global-search></global-search>
        </b-nav-form>
      </div>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item :to="{name: 'admin-boost-index'}" v-if="isGranted('ROLE_ADMIN')">
            <i class="fab fa-accessible-icon"></i>
            Boosts
          </b-nav-item>
          <b-nav-item :to="{name: 'admin-user-index'}" v-if="isGranted('ROLE_ADMIN')">
            <i class="fas fa-coins"></i>
            Balances
          </b-nav-item>
          <b-nav-item :to="{name: 'user-leaderboard-index'}" v-if="isGranted('ROLE_ADMIN')">
            <i class="fas fa-medal"></i>
            Leaderboard
          </b-nav-item>
          <b-nav-item :to="{name: 'admin-realm-index'}"
                      v-if="isGranted('ROLE_ADMIN')">
            <i class="fas fa-mountain"></i>
            Serveurs
          </b-nav-item>
          <b-nav-item :to="{name: 'admin-realm-overview'}" v-if="isGranted('ROLE_ADMIN')">
            <i class="fas fa-university"></i>
            Banque Globale
          </b-nav-item>
        </b-navbar-nav>

        <div class="m-auto" v-if="isAuthenticated && isGranted('ROLE_ADMIN') && !isMobile">
          <b-nav-form>
            <global-search></global-search>
          </b-nav-form>
        </div>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item v-if="isImpersonating">
            Impersonating : {{ user.username }}#{{ user.discriminator }}
          </b-nav-item>
          <b-nav-item v-if="isAuthenticated" :to="{name: 'user-show', params: {id: user._id}}">
            <b-icon-person-fill></b-icon-person-fill>
            Profile
          </b-nav-item>
          <b-nav-item v-if="isAuthenticated" @click.prevent="signOut">
            <b-icon-arrow-right-square></b-icon-arrow-right-square>
            Log out
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <router-view></router-view>
  </div>
</template>

<script>
  import GlobalSearch from './GlobalSearch'

  export default {
    components: {GlobalSearch},
    data () {
      return {
        isMobile: false
      }
    },
    mounted () {
      this.resize()
      window.addEventListener('resize', this.resize)
    },
    methods: {
      resize () {
        this.isMobile = window.innerWidth < 992
      },
      signOut () {
        this.logOut()
        if (this.$route.name !== 'home') {
          this.$router.push({name: 'home'})
        }
      }
    }
  }
</script>

