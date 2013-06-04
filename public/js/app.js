
$("button").on("click", function(e) {
  $.ajax({
    type: "POST",
    url: "/checkout_branch",
    data: {
      pr: $(e.target).data("id")
    },
    success: branchCheckedOut,
    dataType: "json"
  });
});

function branchCheckedOut(data, status, jqxhr) {
  console.log("data = " + JSON.stringify(data));
  console.log("status = " + status);
}
