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
    const city = this.config.city;
    const allergens = this.config.allergens;
    for (var i = 0; i < allergens.length; i++) {
      var allergen = allergens[i];
      var dict = { }

      dict.allergen_locale = allergen.charAt(0).toUpperCase() + allergen.slice(1);
      if (allergen == "björk") {
        allergen = "bjork";
      }
      else if (allergen == "gråbo") {
        allergen = "grabo"
      }
      else if (allergen == "sälg") {
        allergen = "salg"
      }
      else if (allergen == "gräs") {
        allergen = "gras"
      }
      dict.allergens = allergen
      dict.day1 = hass.states[`sensor.pollenniva_${city}_${allergen}_day_0`],
      dict.day2 = hass.states[`sensor.pollenniva_${city}_${allergen}_day_1`],
      dict.day3 = hass.states[`sensor.pollenniva_${city}_${allergen}_day_2`]
      
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
            <th>${sensors[0].day3.attributes.day}</th>
          </thead>
          ${sensors.map(sensor => `
              <tr class="allergen">
                <td><img src="/local/pollen_img/${sensor.allergens.toLowerCase()}_${sensor.day1.state == "unknown" ? 0 : sensor.day1.state}.svg"/><p>${sensor.allergen_locale}</p></td>
                ${
                  sensor.day1.state == "unknown" ? `<td>okänt</td>` :
                `<td>
                  <img src="/local/pollen_img/${sensor.day1.state + ".png"}"/>
                  <p>${sensor.day1.attributes.description}</p>
                </td>`
                }
                ${
                  sensor.day2.state == "unknown" ? `<td>okänt</td>` :
                  `<td>
                  <img src="/local/pollen_img/${sensor.day2.state + ".png"}"/>
                  <p>${sensor.day2.attributes.description}</p>
                </td>`
                }
                ${
                  sensor.day3.state == "unknown" ? `<td>okänt</td>` :
                  `<td>
                  <img src="/local/pollen_img/${sensor.day3.state + ".png"}"/>
                  <p>${sensor.day3.attributes.description}</p>
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
              </style>
              <table class="forecast">
              <tr class="allergen">
                  ${sensors.map(sensor => `
                        <td>
                        <p>${sensor.allergen_locale}</p>
                        <img src="/local/pollen_img/${sensor.allergens.toLowerCase()}_${sensor.day1.state == "unknown" ? 0 : sensor.day1.state}.svg"/>
                        <p>${sensor.day1.attributes.description}</p>
                        </td>
                      `).join('')}</tr>
                      </div>
                      </div>`
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