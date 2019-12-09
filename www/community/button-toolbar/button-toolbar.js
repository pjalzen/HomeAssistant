import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@0.6.5/lit-element.js?module';

const styles = html`
  <style>
    [style*="--aspect-ratio"] {
      position: relative;
    }

    [style*="--aspect-ratio"]::before {
      content: "";
      display: block;
      padding-bottom: calc(100% / (var(--aspect-ratio)));
    }

    [style*="--aspect-ratio"] > :first-child {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
    }

    ha-card {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .content {
      flex: 1;
      text-align: center;
      cursor: pointer;
      position: relative;
    }

    .content img {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
    }

    .toolbar {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      background: var(--primary-color);
      height: 30%;
    }

    .toolbar paper-icon-button {
      color: var(--text-primary-color, white);
      flex-direction: column;
      height: 100%;
    }

    .state {
      display: table;
      height: 100%;
      text-align: center;
      padding: 8px;
    }

    .state span {
      display: table-cell;
      vertical-align: middle;
    }
`

class ButtonToolbarCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    }
  }

  handleMore() {
    const e = new Event('hass-more-info', { bubbles: true, composed: true })
    e.detail = { entityId: this.config.content.entity }
    this.dispatchEvent(e);
  }

  render() {
    const aspect_ratio = this.config.aspect_ratio != null ? this.config.aspect_ratio : '1/1'

    return html`
      ${styles}
      <div id="aspect-ratio" style="--aspect-ratio: ${aspect_ratio};">
        <ha-card>
          ${this.renderContent()}
          ${this.renderToolbar()}
        </ha-card>
      </div>
    `
  }

  renderContent() {
    const { content } = this.config

    return html`
      <div class="content" @click='${(e) => this.handleMore()}' ?more-info=true>
        <img src="${content.image}" style="height: ${content.height};">
      </div>
    `
  }

  renderToolbar() {
    const { toolbar } = this.config
    const buttons = toolbar.map(({ type, entity, name, icon, unit, service }) => {
      if (type === 'service') {
        const execute = () => {
          const args = service.name.split('.')
          this.hass.callService(args[0], args[1], {
            entity_id: service.entity
          });
        }
        return html`<paper-icon-button icon="${icon}" title="${name}" @click='${execute}'></paper-icon-button>`
      } else if (type === 'state') {

        const stateEntity = this.hass.states[entity]
        const stateUnit = unit != null ? unit : stateEntity.attributes.unit_of_measurement;

        return html`<div class="state"><span>${stateEntity.state} ${stateUnit}</span></div>`
      }
    })

    return html`
      <div class="toolbar">
        ${buttons}
      </div>
    `
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('button-toolbar', ButtonToolbarCard);