class PollenKollCard extends HTMLElement {
  set hass(hass) {

    var card = null;
    if (!this.content) {
      card = document.createElement('ha-card');
      this.content = document.createElement('div');
      this.content.className = 'card';
      card.appendChild(this.content);
      this.appendChild(card);
    }
    var sensors = [];
    const cityConf = this.config.city.toLowerCase();
    var cityReplace1 = cityConf.replace('å', 'a')
    var cityReplace2 = cityReplace1.replace('ä', 'a')
    var city = cityReplace2.replace('ö', 'o')

    const allergens = this.config.allergens;
    for (var i = 0; i < allergens.length; i++) {
      var dict = {};
      dict.allergen_locale = (allergens[i].charAt(0).toUpperCase() + allergens[i].slice(1));
      var allergen = allergens[i].replace(' / ', '_').toLowerCase();

      var allergenReplace = allergen.replace('å', 'a')
      var allergenReplace2 = allergenReplace.replace('ä', 'a')
      var allergenReplaced = allergenReplace2.replace('ö', 'o')

      dict.allergens = allergenReplaced
      dict.day1 = hass.states[`sensor.pollenniva_${city}_${allergenReplaced}_day_0`],
        dict.day2 = hass.states[`sensor.pollenniva_${city}_${allergenReplaced}_day_1`],
        dict.day3 = hass.states[`sensor.pollenniva_${city}_${allergenReplaced}_day_2`]

      sensors.push(dict)
    }
    if (card != null && (this.config.title == null || this.config.title == true)) {
      card.header = `Pollenprognos ${city.charAt(0).toUpperCase() + city.slice(1)}`;
    }

    this.content.innerHTML = this.config.minimal == false || this.config.minimal == null ?

      `
      <style>
        .forecast {
          width: 100%;
          padding: 7px;
          height: 100%;
        }
        td {
          padding: 3px;
          text-align: center;
        }
        ${this.config.compact == true ?
        `img {
            width: 50%;
          }
          p {
            margin-top: 3px;
          }`
        : ``

      }

      </style>
      <table class="forecast">
          <thead>
            <th>Pollen</th>
            <th>Idag</th>
            <th>Imorgon</th>
            <th>${sensors[0].day3.state == "unknown" ? "I övermorgon" : sensors[0].day3.attributes.day}</th>
          </thead>
          ${sensors.map(sensor => `
              <tr class="allergen">
                <td><img src="/local/pollen_img/${sensor.allergens.toLowerCase()}_${sensor.day1.state == "unknown" ? 0 : sensor.day1.state}.svg"/><p>${sensor.allergen_locale}</p></td>
                ${sensor.day1.state == "unknown" ? `<td>okänt</td>` :
          `<td>
                  <img src="/local/pollen_img/${sensor.day1.state + ".svg"}"/>
                  ${this.config.show_state == true || this.config.show_state == null ? `<p class="state-text">${sensor.day1.attributes.description} </p>`: ""}
                  </td>`
        }
                ${sensor.day2.state == "unknown" ? `<td>okänt</td>` :
          `<td>
                  <img src="/local/pollen_img/${sensor.day2.state + ".svg"}"/>
                  ${this.config.show_state == true || this.config.show_state == null ? `<p class="state-text">${sensor.day2.attributes.description} </p>`: ""}
                  </td>`
        }
                ${sensor.day3.state == "unknown" ? `<td>okänt</td>` :
          `<td>
                  <img src="/local/pollen_img/${sensor.day3.state + ".svg"}"/>
                  ${this.config.show_state == true || this.config.show_state == null ? `<p class="state-text">${sensor.day3.attributes.description} </p>`: ""}
                  </td>`
        }
              </tr>`).join('')}
              </div>
              </div>`
      :
      `
              <style>
                .forecast {
                  width: 100%;
                  padding: 7px;
                  height: 100%;
                }
                td {
                  padding: 3px;
                  text-align: center;
                }
                .container {
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  text-align: center;
                  justify-content: space-evenly;
                  align-items: center;
                }
                .sensor {
                  margin: 10px;
                  flex: 1 1 0;
                  flex-direction: column;
                  justify-content: space-evenly;
                  display: flex;
                  align-self: flex-start;
                }
                @supports not (-ms-flex: 1) {
                  .container {
                    height: auto; /* 2 */
                    min-height: 24em; /* 2 */
                  }
                }
                
                .sensor {
                  display: block;
                  min-width: 16.66%;
                  flex: 1;
                }
               </style>
                      <div class="container">
                        ${sensors.map(sensor => `
                        <div class="sensor">
                          <p class="box">${sensor.allergen_locale}</p>
                          <img class="box" src="/local/pollen_img/${sensor.allergens.toLowerCase()}_${sensor.day1.state == "unknown" ? 0 : sensor.day1.state}.svg"/>
                          ${this.config.show_state == true || this.config.show_state == null ? `<p class="box">${sensor.day1.attributes.description} </p>`: ""}
                        </div>
                      `).join('')}
                      </div>
                      `
  }

  setConfig(config) {
    if (!config.allergens) {
      throw new Error('Please define allergens (list)');
    }
    if (!config.city) {
      throw new Error('Please define city');
    }
    this.config = config;
  }

  // // @TODO: This requires more intelligent logic
  // getCardSize() {
  //   return 3;
  // }
}

customElements.define('pollenkoll-card', PollenKollCard);