import VerticalLayout from "./VerticalLayout.js"
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from "./Actions.js"

const row = (bill) => {
	return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.hasOwnProperty("formattedDate") ? bill.formattedDate : bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `
}

/* Ordonner les factures du plus récent au plus ancien */
const rows = (data) => {
	if(data && data.length) {
    const billsSorted = data.filter(invalidBills).sort(antiChrono)
    return billsSorted.map((bill) => row(bill)).join("")
  } else {
    return ""
  }
}

const invalidBills = (bill) => (bill.date === null ? false : true)

const antiChrono = (a, b) => {
  const currentDate = a.hasOwnProperty("ISODate") ? a.ISODate : a.date // On vérifie si la date est au format ISO 
  const nextDate = b.hasOwnProperty("ISODate") ? b.ISODate : b.date // On vérifie si la date est au format ISO

  return (currentDate < nextDate ? 1 : (currentDate > nextDate) ? -1 : 0)
}

export default ({ data: bills, loading, error }) => {
	const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `

	if (loading) {
		return LoadingPage()
	} else if (error) {
		return ErrorPage(error)
	}

	return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
}
