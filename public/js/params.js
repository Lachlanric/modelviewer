function load_params_from_arr(params) {
  document.getElementById("roll_p").value = params[0];
  document.getElementById("pitch_p").value = params[1];
  document.getElementById("yaw_p").value = params[2];
  document.getElementById("roll_i").value = params[3];
  document.getElementById("pitch_i").value = params[4];
  document.getElementById("yaw_i").value = params[5];
  document.getElementById("roll_d").value = params[6];
  document.getElementById("pitch_d").value = params[7];
  document.getElementById("yaw_d").value = params[8];
  document.getElementById("roll_integral_limit").value = params[9];
  document.getElementById("pitch_integral_limit").value = params[10];
  document.getElementById("yaw_integral_limit").value = params[11];
  document.getElementById("nw_scale").value = params[12];
  document.getElementById("ne_scale").value = params[13];
  document.getElementById("sw_scale").value = params[14];
  document.getElementById("se_scale").value = params[15];
  document.getElementById("forward_angle").value = params[16];
  document.getElementById("backward_angle").value = params[17];
  document.getElementById("left_angle").value = params[18];
  document.getElementById("right_angle").value = params[19];
  document.getElementById("yaw_deadzone").value = params[20];
  document.getElementById("yaw_speed").value = params[21];
}

function getCurrentStabiliserParams() {
  const params = [
    document.getElementById("roll_p").value,
    document.getElementById("pitch_p").value,
    document.getElementById("yaw_p").value,

    document.getElementById("roll_i").value,
    document.getElementById("pitch_i").value,
    document.getElementById("yaw_i").value,

    document.getElementById("roll_d").value,
    document.getElementById("pitch_d").value,
    document.getElementById("yaw_d").value,

    document.getElementById("roll_integral_limit").value,
    document.getElementById("pitch_integral_limit").value,
    document.getElementById("yaw_integral_limit").value,

    document.getElementById("nw_scale").value,
    document.getElementById("ne_scale").value,
    document.getElementById("sw_scale").value,
    document.getElementById("se_scale").value,

    document.getElementById("forward_angle").value,
    document.getElementById("backward_angle").value,
    document.getElementById("left_angle").value,
    document.getElementById("right_angle").value,

    document.getElementById("yaw_deadzone").value,
    document.getElementById("yaw_speed").value,
  ];
  return params;
}
