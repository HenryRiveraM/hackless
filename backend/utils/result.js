/**
 * Patrón Result para manejo consistente de operaciones
 * Retorna {ok: true, data: ...} o {ok: false, error: "mensaje"}
 */

class Result {
  constructor(ok, data = null, error = null) {
    this.ok = ok;
    this.data = data;
    this.error = error;
  }

  static success(data = null) {
    return new Result(true, data, null);
  }

  static failure(error) {
    return new Result(false, null, error);
  }

  isOk() {
    return this.ok === true;
  }

  isError() {
    return this.ok === false;
  }

  getErrorOrThrow() {
    if (this.isError()) {
      throw new Error(this.error);
    }
    return this.data;
  }
}

module.exports = Result;
