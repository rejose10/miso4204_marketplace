/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['component/addressComponent', 'component/creditCardComponent', 'component/billComponent'], function(adressCp, creditCardCp, billCp) {
    App.Component.PurchaseIntegrator = App.Component.BasicComponent.extend({
        initialize: function() {
            this.componentId = App.Utils.randomInteger();
            this.name = "Purchase";

            this.setupAdressComponent();
        },
                      
        setupAdressComponent: function() {
            this.addressComponent = new adressCp();
            this.addressComponent.initialize();
            this.addressComponent.clearGlobalActions();
            this.addressComponent.clearRecordActions();
            this.addressComponent.addGlobalAction({
                name: 'cancelar',
                icon: '',
                displayName: 'Cancelar',
                show: true
            }, this.cancel, this);
            this.addressComponent.addRecordAction({
                name: 'seleccionar',
                icon: '',
                displayName: 'Seleccionar',
                show: true
            },
            _.bind(function(evt){ this.selectAddress(evt); }, this), this);
            this.addressComponent.render('main');
            $('.breadcrumb').html('');
            $('.breadcrumb').append('<li class="active">Shopping Address</li>');            
        },
        
        selectAddress: function(obj) {
            var selectedId = obj.id;
            this.selectedAddress = this.searchAddressById(selectedId);            
            this.setupCreditCardComponent();            
        },
        
        searchAddressById: function(id){
            var addresses = this.addressComponent.listComponent.listController.model.attributes.data;
            for(var i = 0, l = addresses.length; i<l; i++){
                if(addresses[i].id === id){
                    return addresses[i];
                }
            }
        },
        
        setupCreditCardComponent: function() {
            this.creditCardComponent = new creditCardCp();
            this.creditCardComponent.initialize();            
            this.creditCardComponent.clearGlobalActions();
            this.creditCardComponent.clearRecordActions();            
            this.creditCardComponent.addGlobalAction({
                name: 'cancelar',
                icon: '',
                displayName: 'Cancelar',
                show: true
            }, this.cancel, this);
            this.creditCardComponent.addRecordAction({
                name: 'seleccionar',
                icon: '',
                displayName: 'Seleccionar',
                show: true
            },
            _.bind(function(evt){ this.selectCreditCard(evt); }, this), this);
            $('#main').html('');
            this.creditCardComponent.render('main');
            $('.breadcrumb').html('');
            $('.breadcrumb').append('<li>Shopping Address</li>');
            $('.breadcrumb').append('<li class="active">Credit Card</li>');
        },
        
        selectCreditCard: function(obj) {
            var selectedId = obj.id;
            this.selectedPayment = this.searchCreditCardById(selectedId);  
            this.initBillTemplate();
        },
        
        searchCreditCardById: function(id){
            var creditCard = this.creditCardComponent.listComponent.listController.model.attributes.data;
            for(var i = 0, l = creditCard.length; i<l; i++){
                if(creditCard[i].id === id){
                    return creditCard[i];
                }
            }
        },
                
        initBillTemplate: function(){
                        
            $('#main').html('');
            this.billComponent = new billCp();
            this.billComponent.initialize({addressList:this.selectedAddress, paymentList:this.selectedPayment, purchaseIntegrator:this});
            $('.breadcrumb').html('');
            this.billComponent.render('main');
            $('.breadcrumb').append('<li>Shopping Address</li>');
            $('.breadcrumb').append('<li>Credit Card</li>');
            $('.breadcrumb').append('<li class="active">Confirm and Pay</li>');
        },
        
        pay: function(){
            
            // Obtenci{on de Fecha
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!

            var yyyy = today.getFullYear();
                if(dd<10){
                dd='0'+dd;
            } 
            if(mm < 10){
                mm='0'+mm;
            } 
            var today = dd+'/'+mm+'/'+yyyy;
            
            // Definicion de la compra
            var purchase = {
                //id: '',
                name:'purchase',
                purchaseDate:today,
                totalValue:0,
                totalItems:0,
                points:0,
                buyerId:0,
                addressId: this.purchaseIntegrator.selectedAddress.id
            };

            var purchaseMaster = {
                id: 0,
                purchaseEntity: {
                    id: purchase.id,
                    name:  purchase.name,
                    purchaseDate: purchase.purchaseDate,
                    totalValue: purchase.totalValue,
                    totalItems:purchase.totalItems,
                    points:purchase.points,
                    buyerId:purchase.buyerId,
                    addressId:purchase.addressId
                },
                createpurchaseItem: [
                    {
                        unitPrice :0,  
                        quantity :0,  
                        name :'purchaseItem',
                        productId:'' 
                    }
                ],
                createpayment:[{
                        value:purchase.totalValue,
                        tokenBank:'',
                        name:'payment',
                        creditcardId:this.purchaseIntegrator.selectedPayment.id,
                        paymentmodeId:''
                }]
            };
             
            $.ajax({
                url: 'http://localhost:8080/purchase.services/webresources/master/purchases/',
                type: 'POST',
                data: JSON.stringify(purchaseMaster),
                contentType: 'application/json'
            }).done(_.bind(function(data) {
                console.log("_bind"); //callback(data);
                alert('COMPRA GUARDADA!!');    // Continuar con ciclo de compra
                document.location.href="http://localhost:8080/purchase.web";
            }, this)).error(_.bind(function(data) {
                console.log("callback error"); //callback(data);
                alert('ERROR REALIZANDO LA COMPRA - INTENTE MAS TARDE'); // Continuar con ciclo de compra
                document.location.href="http://localhost:8080/purchase.web";
            }, this));
            
           
        },
        
        useBonus: function(){
            
        },
        
        cancel: function(){
            document.location.href="http://localhost:8080/purchase.web";
        }
    });
    return App.Component.PurchaseIntegrator;
});

