export default class TabProcessor {
  constructor(type, context) {
    this.context = context;
    this.type = type;
  }

  isDisplay() {
    if (!this.type.access) return false;

    if (this.type.access.show) {
      return (
        this.type.access.show === '*' || this.type.access.show.includes(this.context.stateCode)
      );
    }

    if (this.type.access.hidden) {
      return !(
        this.type.access.hidden === '*' || this.type.access.hidden.includes(this.context.stateCode)
      );
    }

    return false;
  }

  isReadonly() {
    if (!this.type.access || !this.isDisplay()) return false;

    if (this.type.access.editable) {
      return !(
        this.type.access.editable === '*' ||
        this.type.access.editable.includes(this.context.stateCode)
      );
    }

    if (this.type.access.readonly) {
      return (
        this.type.access.readonly === '*' ||
        this.type.access.readonly.includes(this.context.stateCode)
      );
    }

    return false;
  }

  isRequired() {
    return this.isDisplay() && this.type?.required?.includes(this.context.stateCode);
  }
}
