from django.shortcuts import render

# Create your views here.
def meuslivros(request):
    return render(request, "Mylivros/meuslivros.html")